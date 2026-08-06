import { OrderStatus, OrderType, prisma } from "@repo/db"
import type { EngineState, Orderbook, UserStockBalance } from "@repo/types/engine"

export const loadFromDb = async (): Promise<EngineState> => {
    const [dbInrBalances, dbStockBalances, dbOrders] = await Promise.all([
        prisma.inrBalance.findMany(),
        prisma.stockBalance.findMany(),
        prisma.order.findMany({
            where: {
                status: {
                    in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FULFILLED]
                }
            }
        })
    ])
    const inrBalances = new Map(
        dbInrBalances.map((balance) =>
            [
                balance.userId,
                { available: balance.available, locked: balance.locked }
            ]
        ))

    const stockBalances: UserStockBalance = new Map()
    for (const balance of dbStockBalances) {
        let userMarkets = stockBalances.get(balance.userId)
        if (!userMarkets) {
            userMarkets = new Map()
            stockBalances.set(balance.userId, userMarkets)
        }

        let market = userMarkets.get(balance.marketId)
        if (!market) {
            market = {
                YES: { available: 0, locked: 0 },
                NO: { available: 0, locked: 0 }
            }
            userMarkets.set(balance.marketId, market)
        }

        market[balance.side] = {
            available: balance.available,
            locked: balance.locked
        }
    }


    const orderbook: Orderbook = new Map()

    for (const order of dbOrders) {
        let marketBook = orderbook.get(order.marketId)
        if (!marketBook) {
            marketBook = {
                YES: { asks: new Map(), bids: new Map() },
                NO: { asks: new Map(), bids: new Map() },
                ordersById: new Map()
            }
            orderbook.set(order.marketId, marketBook)
        }

        const engineOrder = {
            price: order.price,
            marketId: order.marketId,
            quantity: order.quantity,
            type: order.type,
            side: order.side,
            filledQuantity: order.filledQuantity,
        }

        const sidebook = marketBook[order.side][order.type === OrderType.BUY ? "bids" : "asks"]
        let priceLevel = sidebook.get(order.price)
        if (!priceLevel) {
            priceLevel = { price: order.price, orders: [], totalQuantity: 0 }
            sidebook.set(order.price, priceLevel)
        }

        priceLevel.orders.push(engineOrder)
        priceLevel.totalQuantity += order.quantity - order.filledQuantity
        marketBook.ordersById.set(order.id, engineOrder)
    }

    return { inrBalances, stockBalances, orderbook }
}