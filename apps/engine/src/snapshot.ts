import type { EngineSnapshot, EngineState, PriceLevel, Sidebook } from "@repo/types/engine";

const toSidebook = (snap: Record<number, PriceLevel>): Sidebook =>
    new Map(Object.entries(snap).map(([price, level]) => [Number(price), level]))

export const toSnapshot = ({ orderbook, inrBalances, stockBalances }: EngineState): EngineSnapshot => {
    return {
        inrBalances: Object.fromEntries(inrBalances),
        stockBalances: Object.fromEntries([...stockBalances].map(([userId, markets]) => [
            userId,
            Object.fromEntries(markets)
        ])),
        orderbook: Object.fromEntries([...orderbook].map(([marketId, marketBook]) => [
            marketId,
            {
                YES: {
                    asks: Object.fromEntries(marketBook.YES.asks),
                    bids: Object.fromEntries(marketBook.YES.bids)
                },
                NO: {
                    asks: Object.fromEntries(marketBook.NO.asks),
                    bids: Object.fromEntries(marketBook.NO.bids)
                },
                ordersById: Object.fromEntries(marketBook.ordersById)
            }
        ]))
    }
}

export const fromSnapshot = (snap: EngineSnapshot): EngineState => {
    const inrBalances = new Map(Object.entries(snap.inrBalances))
    const stockBalances = new Map(
        Object.entries(snap.stockBalances)
            .map(([userId, marketBalances]) =>
                [userId, new Map(Object.entries(marketBalances))]
            ))
    const orderbook = new Map(
        Object.entries(snap.orderbook)
            .map(([marketId, marketBook]) => {
                return [marketId, {
                    YES: {
                        bids: toSidebook(marketBook.YES.bids),
                        asks: toSidebook(marketBook.YES.asks),
                    },
                    NO: {
                        bids: toSidebook(marketBook.NO.bids),
                        asks: toSidebook(marketBook.NO.asks),
                    },
                    ordersById: new Map(
                        Object.entries(marketBook.ordersById)
                    ),
                }]
            })
    )
    return { inrBalances, stockBalances, orderbook }
}
