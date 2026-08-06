import type { Balance } from "../balance"
import type { PlaceOrderInput } from "../order"

export type MarketStockBalance = {
    YES: Balance, NO: Balance
}

export type UserStockBalance = Map<string, Map<string, MarketStockBalance>>

export type Order = PlaceOrderInput & { filledQuantity: number }

export type PriceLevel = {
    price: number,
    orders: Order[],
    totalQuantity: number
}

export type Sidebook = Map<number, PriceLevel>
export type MarketBook = {
    YES: { bids: Sidebook, asks: Sidebook },
    NO: { bids: Sidebook, asks: Sidebook },
    ordersById: Map<string, Order>
}

export type Orderbook = Map<string, MarketBook>

export type EngineState = {
    orderbook: Orderbook
    inrBalances: Map<string, Balance>
    stockBalances: UserStockBalance
}

type SnapSidebook = Record<number, PriceLevel>

type SnapMarketBook = {
    YES: { asks: SnapSidebook, bids: SnapSidebook },
    NO: { asks: SnapSidebook, bids: SnapSidebook },
    ordersById: Record<string, Order>
}

export type EngineSnapshot = {
    inrBalances: Record<string, Balance>,
    stockBalances: Record<string, Record<string, MarketStockBalance>>,
    orderbook: Record<string, SnapMarketBook>
}