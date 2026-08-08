import type { GetOrderbookRes, GetTradesRes, PlaceOrderRes, SidebookView } from "@repo/types/engine";

/** Store INR as integer paise; APIs speak in rupees. */
export const toPaise = (rupees: number) => Math.round(rupees * 100)

export const toRupees = (paise: number) => paise / 100

const sidebookInRupees = (side: SidebookView): SidebookView => ({
    bids: side.bids.map((level) => ({ ...level, price: toRupees(level.price) })),
    asks: side.asks.map((level) => ({ ...level, price: toRupees(level.price) })),
})

export const orderbookInRupees = (data: GetOrderbookRes): GetOrderbookRes => ({
    ...data,
    YES: sidebookInRupees(data.YES),
    NO: sidebookInRupees(data.NO),
})

export const tradesInRupees = (data: GetTradesRes): GetTradesRes => ({
    ...data,
    trades: data.trades.map((t) => ({ ...t, price: toRupees(t.price) })),
})

export const placeOrderResInRupees = (data: PlaceOrderRes): PlaceOrderRes => ({
    ...data,
    orders: data.orders.map((o) => ({ ...o, price: toRupees(o.price) })),
    trades: data.trades.map((t) => ({ ...t, price: toRupees(t.price) })),
    inrBalances: data.inrBalances.map((b) => ({
        ...b,
        available: toRupees(b.available),
        locked: toRupees(b.locked),
    })),
})
