import {
    prisma,
    MarketStatus,
    OrderStatus,
    OrderType,
    Side,
    type Order,
    type Prisma,
} from "@repo/db"

/** ₹10 per Yes+No pair → 1000 paise. Winning share pays full pair value. */
const PAYOUT_PER_SHARE_PAISE = 1000
/** On cancel, each share refunds half a pair (₹5). */
const REFUND_PER_SHARE_PAISE = 500

const OPEN_ORDER_STATUSES = [OrderStatus.PENDING, OrderStatus.PARTIALLY_FULFILLED] as const

type Tx = Prisma.TransactionClient

const remainingQty = (order: Order) => order.quantity - order.filledQuantity

const creditInr = (tx: Tx, userId: string, paise: number) =>
    tx.inrBalance.update({
        where: { userId },
        data: { available: { increment: paise } },
    })

const unlockBuy = (tx: Tx, order: Order) => {
    const amount = order.price * remainingQty(order)
    return tx.inrBalance.update({
        where: { userId: order.userId },
        data: {
            available: { increment: amount },
            locked: { decrement: amount },
        },
    })
}

const unlockSell = (tx: Tx, order: Order) => {
    const qty = remainingQty(order)
    return tx.stockBalance.update({
        where: {
            userId_marketId_side: {
                userId: order.userId,
                marketId: order.marketId,
                side: order.side,
            },
        },
        data: {
            available: { increment: qty },
            locked: { decrement: qty },
        },
    })
}

const cancelOpenOrders = async (tx: Tx, marketId: string) => {
    const orders = await tx.order.findMany({
        where: { marketId, status: { in: [...OPEN_ORDER_STATUSES] } },
    })

    await Promise.all(
        orders.map(async (order) => {
            await (order.type === OrderType.BUY ? unlockBuy(tx, order) : unlockSell(tx, order))
            await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CANCELLED },
            })
        }),
    )
}

const clearMarketStock = (tx: Tx, marketId: string) =>
    tx.stockBalance.deleteMany({ where: { marketId } })

const resolveSettlement = async (tx: Tx, marketId: string, outcome: Side) => {
    // Snapshot before unlock so locked winning shares are still counted
    const winners = await tx.stockBalance.findMany({
        where: { marketId, side: outcome },
        select: { userId: true, available: true, locked: true },
    })

    await cancelOpenOrders(tx, marketId)

    await Promise.all(
        winners.map((row) => {
            const shares = row.available + row.locked
            return shares > 0
                ? creditInr(tx, row.userId, shares * PAYOUT_PER_SHARE_PAISE)
                : Promise.resolve()
        }),
    )

    await clearMarketStock(tx, marketId)
}

const cancelSettlement = async (tx: Tx, marketId: string) => {
    await cancelOpenOrders(tx, marketId)

    const holders = await tx.stockBalance.findMany({ where: { marketId } })

    await Promise.all(
        holders.map((holder) =>
            creditInr(
                tx,
                holder.userId,
                REFUND_PER_SHARE_PAISE * (holder.available + holder.locked),
            ),
        ),
    )

    await clearMarketStock(tx, marketId)
}

export const balanceSettlement = async (
    tx: Tx,
    marketId: string,
    status: MarketStatus,
    outcome?: Side | null,
) => {
    switch (status) {
        case MarketStatus.RESOLVED:
            if (!outcome) {
                throw new Error("Outcome is required when resolving a market")
            }
            return resolveSettlement(tx, marketId, outcome)
        case MarketStatus.CANCELLED:
            return cancelSettlement(tx, marketId)
        default:
            break
    }
}

export const updateMarketStatus = async (
    marketId: string,
    status: MarketStatus,
    outcome?: Side | null,
) => {
    return prisma.$transaction(async (tx) => {
        await balanceSettlement(tx, marketId, status, outcome)

        return tx.market.update({
            where: { id: marketId },
            data: {
                status,
                outcome: status === MarketStatus.RESOLVED ? outcome! : null,
            },
            include: {
                categories: {
                    select: { id: true, name: true },
                },
            },
        })
    })
}
