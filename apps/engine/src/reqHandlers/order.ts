import { OrderStatus } from "@repo/db";
import type { Balance } from "@repo/types/balance";
import type {
    EngineRes,
    Order,
    Orderbook,
    Sidebook,
    UserStockBalance,
} from "@repo/types/engine";
import type { Side } from "@repo/types/market";
import { OrderType, type PlaceOrderInput } from "@repo/types/order";
import { getOrCreateMarketBook } from "../utils";

const remaining = (order: Order) => order.quantity - order.filledQuantity;

const getStatus = (order: Order): OrderStatus => {
    if (order.filledQuantity === 0) return OrderStatus.PENDING;
    if (remaining(order) === 0) return OrderStatus.FULFILLED;
    return OrderStatus.PARTIALLY_FULFILLED;
};

const getInr = (inrBalances: Map<string, Balance>, userId: string): Balance => {
    let balance = inrBalances.get(userId);
    if (!balance) {
        balance = { available: 0, locked: 0 };
        inrBalances.set(userId, balance);
    }
    return balance;
};

const getStock = (
    stockBalances: UserStockBalance,
    userId: string,
    marketId: string,
    side: Side,
): Balance => {
    let markets = stockBalances.get(userId);
    if (!markets) {
        markets = new Map();
        stockBalances.set(userId, markets);
    }

    let market = markets.get(marketId);
    if (!market) {
        market = {
            YES: { available: 0, locked: 0 },
            NO: { available: 0, locked: 0 },
        };
        markets.set(marketId, market);
    }

    return market[side];
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

/** Move filled qty out of locked balances and credit the counterparty. */
const settleFill = (
    buy: Order,
    sell: Order,
    fill: number,
    price: number,
    inrBalances: Map<string, Balance>,
    stockBalances: UserStockBalance,
) => {
    const cost = price * fill;

    const buyInr = getInr(inrBalances, buy.userId);
    buyInr.locked -= cost;
    getStock(stockBalances, buy.userId, buy.marketId, buy.side).available += fill;

    getStock(stockBalances, sell.userId, sell.marketId, sell.side).locked -= fill;
    getInr(inrBalances, sell.userId).available += cost;
};

const matchAtPrice = (
    book: Sidebook,
    price: number,
    taker: Order,
    inrBalances: Map<string, Balance>,
    stockBalances: UserStockBalance,
    matched: Order[],
) => {
    const level = book.get(price);
    if (!level) return;

    while (remaining(taker) > 0 && level.orders.length > 0) {
        const maker = level.orders[0]!;
        const fill = Math.min(remaining(taker), remaining(maker));

        const buy = taker.type === OrderType.BUY ? taker : maker;
        const sell = taker.type === OrderType.SELL ? taker : maker;
        settleFill(buy, sell, fill, price, inrBalances, stockBalances);

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
    userId: string;
    data: PlaceOrderInput;
};

export const handlePlaceOrder = ({
    orderbook,
    inrBalances,
    stockBalances,
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
        const { bids, asks } = marketBook[side];
        const isBuy = type === OrderType.BUY;

        matchAtPrice(isBuy ? asks : bids, price, order, inrBalances, stockBalances, matched);
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
            },
        };
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong :(. Please try again later" };
    }
};
