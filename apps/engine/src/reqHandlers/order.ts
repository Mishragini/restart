import { OrderStatus } from "@repo/db";
import type { Balance } from "@repo/types/balance";
import type {
    EngineRes,
    MarketBook,
    Order,
    Orderbook,
    Sidebook,
    Trade,
    UserStockBalance,
} from "@repo/types/engine";
import type { Side } from "@repo/types/market";
import { OrderType, type PlaceOrderInput } from "@repo/types/order";
import { getInr, getOrCreateMarketBook, getStock } from "../utils";

const remaining = (order: Order) => order.quantity - order.filledQuantity;

const getStatus = (order: Order): OrderStatus => {
    if (order.filledQuantity === 0) return OrderStatus.PENDING;
    if (remaining(order) === 0) return OrderStatus.FULFILLED;
    return OrderStatus.PARTIALLY_FULFILLED;
};

type MatchCtx = {
    marketBook: MarketBook;
    inrBalances: Map<string, Balance>;
    stockBalances: UserStockBalance;
    tradebook: Map<string, Trade[]>;
    matched: Order[];
    cancelled: Order[];
    fills: Trade[];
};

/** Lock full order notional / stock up front. */
const lockFunds = (
    order: Order,
    inrBalances: Map<string, Balance>,
    stockBalances: UserStockBalance,
): EngineRes | null => {
    if (order.type === OrderType.BUY) {
        const cost = order.price * order.quantity;
        const inr = getInr(inrBalances, order.userId);
        if (inr.available < cost) {
            return { error: "Insufficient INR balance" };
        }
        inr.available -= cost;
        inr.locked += cost;
        return null;
    }

    const stock = getStock(stockBalances, order.userId, order.marketId, order.side);
    if (stock.available < order.quantity) {
        return { error: "Insufficient stock balance" };
    }
    stock.available -= order.quantity;
    stock.locked += order.quantity;
    return null;
};

/** Return locked funds/shares for the unfilled remainder (used on cancel). */
const unlockRemaining = (order: Order, ctx: MatchCtx) => {
    const qty = remaining(order);
    if (qty <= 0) return;

    if (order.type === OrderType.BUY) {
        const refund = order.price * qty;
        const inr = getInr(ctx.inrBalances, order.userId);
        inr.locked -= refund;
        inr.available += refund;
    } else {
        const stock = getStock(ctx.stockBalances, order.userId, order.marketId, order.side);
        stock.locked -= qty;
        stock.available += qty;
    }
};

/** Settle a fill at maker price: move stock to buyer, cash to seller. */
const settleFill = (
    buy: Order,
    sell: Order,
    fill: number,
    price: number,
    ctx: MatchCtx,
) => {
    const cost = price * fill;
    const lockedForFill = buy.price * fill;

    const buyInr = getInr(ctx.inrBalances, buy.userId);
    buyInr.locked -= lockedForFill;
    buyInr.available += lockedForFill - cost;
    getStock(ctx.stockBalances, buy.userId, buy.marketId, buy.side).available += fill;

    getStock(ctx.stockBalances, sell.userId, sell.marketId, sell.side).locked -= fill;
    getInr(ctx.inrBalances, sell.userId).available += cost;
};

const addTrade = (
    ctx: MatchCtx,
    args: {
        marketId: string;
        price: number;
        quantity: number;
        side: Side;
        buyOrderId: string;
        sellOrderId: string;
    },
): Trade => {
    const trade: Trade = { id: crypto.randomUUID(), ...args };
    const trades = ctx.tradebook.get(args.marketId) ?? [];
    trades.push(trade);
    ctx.tradebook.set(args.marketId, trades);
    return trade;
};

/**
 * Match taker against one price level (FIFO).
 * Own resting orders are cancelled so self-trades never block the book.
 */
const matchAtPrice = (book: Sidebook, price: number, taker: Order, ctx: MatchCtx) => {
    const level = book.get(price);
    if (!level) return;

    while (remaining(taker) > 0 && level.orders.length > 0) {
        const maker = level.orders[0]!;

        if (maker.userId === taker.userId) {
            unlockRemaining(maker, ctx);
            level.totalQuantity -= remaining(maker);
            level.orders.shift();
            ctx.marketBook.ordersById.delete(maker.id);
            ctx.cancelled.push(maker);
            continue;
        }

        const fill = Math.min(remaining(taker), remaining(maker));
        const buy = taker.type === OrderType.BUY ? taker : maker;
        const sell = taker.type === OrderType.SELL ? taker : maker;

        settleFill(buy, sell, fill, price, ctx);
        ctx.fills.push(
            addTrade(ctx, {
                marketId: taker.marketId,
                price,
                quantity: fill,
                side: taker.side,
                buyOrderId: buy.id,
                sellOrderId: sell.id,
            }),
        );

        maker.filledQuantity += fill;
        taker.filledQuantity += fill;
        level.totalQuantity -= fill;
        ctx.matched.push(maker);

        if (remaining(maker) === 0) {
            level.orders.shift();
            ctx.marketBook.ordersById.delete(maker.id);
        }
    }

    if (level.orders.length === 0) {
        book.delete(price);
    }
};

/**
 * Same-side matching only:
 * - BUY  ↔ asks at price <= limit (lowest first)
 * - SELL ↔ bids at price >= limit (highest first)
 * Unfilled remainder rests as PENDING.
 */
const matchOrder = (book: Sidebook, taker: Order, ctx: MatchCtx) => {
    const isBuy = taker.type === OrderType.BUY;
    const prices = [...book.keys()]
        .filter((p) => (isBuy ? p <= taker.price : p >= taker.price))
        .sort((a, b) => (isBuy ? a - b : b - a));

    for (const price of prices) {
        if (remaining(taker) <= 0) break;
        matchAtPrice(book, price, taker, ctx);
    }
};

const restOrder = (book: Sidebook, order: Order, ctx: MatchCtx) => {
    const qty = remaining(order);
    if (qty <= 0) return;

    let level = book.get(order.price);
    if (!level) {
        level = { price: order.price, orders: [], totalQuantity: 0 };
        book.set(order.price, level);
    }

    level.orders.push(order);
    level.totalQuantity += qty;
    ctx.marketBook.ordersById.set(order.id, order);
};

type PlaceOrderArgs = {
    orderbook: Orderbook;
    inrBalances: Map<string, Balance>;
    stockBalances: UserStockBalance;
    tradebook: Map<string, Trade[]>;
    userId: string;
    data: PlaceOrderInput;
};

export const handlePlaceOrder = ({
    orderbook,
    inrBalances,
    stockBalances,
    tradebook,
    userId,
    data,
}: PlaceOrderArgs): EngineRes => {
    try {
        const { price, marketId, quantity, side, type } = data;

        if (!Number.isInteger(price) || price <= 0) {
            return { error: "Invalid price" };
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return { error: "Invalid quantity" };
        }

        const marketBook = getOrCreateMarketBook(orderbook, marketId);

        const order: Order = {
            id: crypto.randomUUID(),
            userId,
            price,
            marketId,
            quantity,
            type,
            side,
            filledQuantity: 0,
        };

        const lockError = lockFunds(order, inrBalances, stockBalances);
        if (lockError) return lockError;

        const ctx: MatchCtx = {
            marketBook,
            inrBalances,
            stockBalances,
            tradebook,
            matched: [],
            cancelled: [],
            fills: [],
        };

        const { bids, asks } = marketBook[side];
        const isBuy = type === OrderType.BUY;

        matchOrder(isBuy ? asks : bids, order, ctx);
        restOrder(isBuy ? bids : asks, order, ctx);

        const cancelledIds = new Set(ctx.cancelled.map((o) => o.id));
        const affected = [order, ...ctx.matched, ...ctx.cancelled];

        const inrByUser = new Map<string, Balance & { userId: string }>();
        const stockByKey = new Map<string, Balance & { userId: string; marketId: string; side: Side }>();

        for (const o of affected) {
            const inr = getInr(inrBalances, o.userId);
            inrByUser.set(o.userId, {
                userId: o.userId,
                available: inr.available,
                locked: inr.locked,
            });

            const stock = getStock(stockBalances, o.userId, o.marketId, o.side);
            stockByKey.set(`${o.userId}:${o.marketId}:${o.side}`, {
                userId: o.userId,
                marketId: o.marketId,
                side: o.side,
                available: stock.available,
                locked: stock.locked,
            });
        }

        return {
            message: "Order Placed successfully!",
            type: "place_order",
            userId,
            data: {
                orders: affected.map((o) => ({
                    ...o,
                    status: cancelledIds.has(o.id)
                        ? OrderStatus.CANCELLED
                        : getStatus(o),
                })),
                inrBalances: [...inrByUser.values()],
                stockBalances: [...stockByKey.values()],
                trades: ctx.fills,
            },
        };
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong :(. Please try again later" };
    }
};
