import type { OrderStatus } from "@repo/db"
import type { Balance, OnRampInr } from "../balance"
import type { MintInput, Side } from "../market"
import type { PlaceOrderInput } from "../order"
import type { Order } from "./state"

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
}

export type OnrampInrRes = {
    inrBalances: InrBalanceMutation[]
}

export type MintRes = {
    stockBalances: StockBalanceMutation[]
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

export type EngineOps = {
    place_order: { req: PlaceOrderInput, res: PlaceOrderRes },
    onramp_inr: { req: OnRampInr, res: OnrampInrRes },
    mint: { req: MintInput, res: MintRes },
    get_orderbook: { req: { marketId: string }, res: GetOrderbookRes },
}

export type EngineOp = keyof EngineOps
