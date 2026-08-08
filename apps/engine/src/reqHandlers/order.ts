import { OrderStatus } from "@repo/db";
import type { Balance } from "@repo/types/balance";
import type {
    EngineRes,
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

/** Lock funds for a resting/taker order. Returns an error response if insufficient. */
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

/** Move filled qty out of locked balances and credit the counterparty at maker price. */
const settleFill = (
    buy: Order,
    sell: Order,
    fill: number,
    price: number,
    inrBalances: Map<string, Balance>,
    stockBalances: UserStockBalance,
) => {
    const cost = price * fill;
    // Buyer locked at their limit; refund any price improvement.
    const lockedForFill = buy.price * fill;

    const buyInr = getInr(inrBalances, buy.userId);
    buyInr.locked -= lockedForFill;
    buyInr.available += lockedForFill - cost;
    getStock(stockBalances, buy.userId, buy.marketId, buy.side).available += fill;

    getStock(stockBalances, sell.userId, sell.marketId, sell.side).locked -= fill;
    getInr(inrBalances, sell.userId).available += cost;
};

/** Record a fill in the in-memory tradebook (keyed by marketId). */
const addTrade = (
    tradebook: Map<string, Trade[]>,
    args: {
        marketId: string;
        price: number;
        quantity: number;
        side: Side;
        buyOrderId: string;
        sellOrderId: string;
    },
): Trade => {
    const trade: Trade = {
        id: crypto.randomUUID(),
        ...args,
    };
    const trades = tradebook.get(args.marketId) ?? [];
    trades.push(trade);
    tradebook.set(args.marketId, trades);
    return trade;
};

/** @returns true if matching must stop because the next maker is the taker (no self-trade). */
const matchAtPrice = (
    book: Sidebook,
    price: number,
    taker: Order,
    inrBalances: Map<string, Balance>,
    stockBalances: UserStockBalance,
    tradebook: Map<string, Trade[]>,
    matched: Order[],
    fills: Trade[],
): boolean => {
    const level = book.get(price);
    if (!level) return false;

    while (remaining(taker) > 0 && level.orders.length > 0) {
        const maker = level.orders[0]!;
        // No self-trades: stop at own resting order (keeps price-time priority).
        if (maker.userId === taker.userId) return true;

        const fill = Math.min(remaining(taker), remaining(maker));

        const buy = taker.type === OrderType.BUY ? taker : maker;
        const sell = taker.type === OrderType.SELL ? taker : maker;
        settleFill(buy, sell, fill, price, inrBalances, stockBalances);

        fills.push(
            addTrade(tradebook, {
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
        matched.push(maker);

        if (remaining(maker) === 0) {
            level.orders.shift();
        }
    }

    if (level.orders.length === 0) {
        book.delete(price);
    }
    return false;
};

/**
 * Cross the opposing book:
 * - BUY  matches asks with price <= taker.price (lowest ask first)
 * - SELL matches bids with price >= taker.price (highest bid first)
 */
const matchOrder = (
    book: Sidebook,
    taker: Order,
    inrBalances: Map<string, Balance>,
    stockBalances: UserStockBalance,
    tradebook: Map<string, Trade[]>,
    matched: Order[],
    fills: Trade[],
) => {
    const isBuy = taker.type === OrderType.BUY;
    const prices = [...book.keys()]
        .filter((p) => (isBuy ? p <= taker.price : p >= taker.price))
        .sort((a, b) => (isBuy ? a - b : b - a));

    for (const price of prices) {
        if (remaining(taker) <= 0) break;
        const blockedBySelf = matchAtPrice(
            book,
            price,
            taker,
            inrBalances,
            stockBalances,
            tradebook,
            matched,
            fills,
        );
        if (blockedBySelf) break;
    }
};

const restOrder = (book: Sidebook, order: Order) => {
    const qty = remaining(order);
    if (qty <= 0) return;

    let level = book.get(order.price);
    if (!level) {
        level = { price: order.price, orders: [], totalQuantity: 0 };
        book.set(order.price, level);
    }

    level.orders.push(order);
    level.totalQuantity += qty;
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

        const matched: Order[] = [];
        const fills: Trade[] = [];
        const { bids, asks } = marketBook[side];
        const isBuy = type === OrderType.BUY;

        matchOrder(isBuy ? asks : bids, order, inrBalances, stockBalances, tradebook, matched, fills);
        restOrder(isBuy ? bids : asks, order);
        marketBook.ordersById.set(order.id, order);

        const affected = [order, ...matched];
        const inrByUser = new Map<string, Balance & { userId: string }>();
        const stockByKey = new Map<string, Balance & { userId: string; marketId: string; side: Side }>();

        for (const o of affected) {
            const inr = getInr(inrBalances, o.userId);
            inrByUser.set(o.userId, { userId: o.userId, available: inr.available, locked: inr.locked });

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
                orders: affected.map((o) => ({ ...o, status: getStatus(o) })),
                inrBalances: [...inrByUser.values()],
                stockBalances: [...stockByKey.values()],
                trades: fills,
            },
        };
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong :(. Please try again later" };
    }
};
