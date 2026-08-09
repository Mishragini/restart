import type { Balance, OnRampInr } from "../balance"
import type { MintInput, Side } from "../market"
import type { OrderStatus, PlaceOrderInput } from "../order"
import type { Order, Trade } from "./state"

export type InrBalanceMutation = Balance & { userId: string }

export type StockBalanceMutation = Balance & {
    userId: string
    marketId: string
    side: Side
}

export type OrderMutation = Order & { status: OrderStatus }

export type PlaceOrderRes = {
    orders: OrderMutation[]
    inrBalances: InrBalanceMutation[]
    stockBalances: StockBalanceMutation[]
    trades: Trade[]
}

export type OnrampInrRes = {
    inrBalances: InrBalanceMutation[]
}

export type MintRes = {
    stockBalances: StockBalanceMutation[]
    inrBalances: InrBalanceMutation[]
}

/** JSON-safe depth level for FE orderbook display (no individual orders). */
export type OrderbookLevel = {
    price: number
    quantity: number
}

export type SidebookView = {
    bids: OrderbookLevel[]
    asks: OrderbookLevel[]
}

export type GetOrderbookRes = {
    marketId: string
    YES: SidebookView
    NO: SidebookView
}

export type GetTradesRes = {
    marketId: string
    trades: Trade[]
}

/** Pub/sub payload from engine → ws (not an EngineReq/EngineRes op). */
export type MarketUpdateMessage = {
    type: "market_update"
    marketId: string
    orderbook: {
        YES: SidebookView
        NO: SidebookView
    }
    trades: Trade[]
}

export type EngineOps = {
    place_order: { req: PlaceOrderInput, res: PlaceOrderRes },
    onramp_inr: { req: OnRampInr, res: OnrampInrRes },
    mint: { req: MintInput, res: MintRes },
    get_orderbook: { req: { marketId: string }, res: GetOrderbookRes },
    get_trades: { req: { marketId: string }, res: GetTradesRes },
}

export type EngineOp = keyof EngineOps
