import type { MarketBook, Orderbook, OrderbookLevel, Sidebook } from "@repo/types/engine";

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

/** Serialize a sidebook Map into sorted price/qty levels for the FE. */
export const toOrderbookLevels = (sidebook: Sidebook, bidsDesc: boolean): OrderbookLevel[] => {
    return [...sidebook.values()]
        .filter((level) => level.totalQuantity > 0)
        .map((level) => ({ price: level.price, quantity: level.totalQuantity }))
        .sort((a, b) => bidsDesc ? b.price - a.price : a.price - b.price)
}
