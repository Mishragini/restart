import type { Balance } from "@repo/types/balance";
import type {
    MarketBook,
    Orderbook,
    OrderbookLevel,
    Sidebook,
    SidebookView,
    Trade,
    UserStockBalance,
} from "@repo/types/engine";
import type { Side } from "@repo/types/market";

/** Complete set (1 Yes + 1 No) costs ₹10 → stored as paise, matching api-server. */
export const MINT_COST_PER_PAIR_PAISE = 1000;

/** Engine state is paise; UI-facing payloads use rupees. */
export const toRupees = (paise: number) => paise / 100;

export const getInr = (inrBalances: Map<string, Balance>, userId: string): Balance => {
    let balance = inrBalances.get(userId);
    if (!balance) {
        balance = { available: 0, locked: 0 };
        inrBalances.set(userId, balance);
    }
    return balance;
};

export const getStock = (
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

export const getOrCreateMarketBook = (orderbook: Orderbook, marketId: string): MarketBook => {
    let marketBook = orderbook.get(marketId);
    if (!marketBook) {
        marketBook = {
            YES: { bids: new Map(), asks: new Map() },
            NO: { bids: new Map(), asks: new Map() },
            ordersById: new Map(),
        };
        orderbook.set(marketId, marketBook);
    }
    return marketBook;
};

/** Serialize a sidebook Map into sorted price/qty levels (prices in paise). */
export const toOrderbookLevels = (sidebook: Sidebook, bidsDesc: boolean): OrderbookLevel[] => {
    return [...sidebook.values()]
        .filter((level) => level.totalQuantity > 0)
        .map((level) => ({ price: level.price, quantity: level.totalQuantity }))
        .sort((a, b) => bidsDesc ? b.price - a.price : a.price - b.price)
}

/** Convert paise levels → rupees for WS / client display. */
export const sidebookInRupees = (side: SidebookView): SidebookView => ({
    bids: side.bids.map((level) => ({ ...level, price: toRupees(level.price) })),
    asks: side.asks.map((level) => ({ ...level, price: toRupees(level.price) })),
})

export const tradesInRupees = (trades: Trade[]): Trade[] =>
    trades.map((t) => ({ ...t, price: toRupees(t.price) }))
