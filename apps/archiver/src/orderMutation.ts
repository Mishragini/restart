import { prisma } from "@repo/db";
import { PlaceOrderRes } from "@repo/types/engine";

export const orderMutation = async (
    _userId: string,
    data: PlaceOrderRes,
) => {
    const { orders, inrBalances, stockBalances, trades } = data
    await prisma.$transaction([
        // Orders first — trades FK to order ids.
        ...orders.map((o) => prisma.order.upsert({
            where: { id: o.id },
            create: {
                id: o.id,
                marketId: o.marketId,
                userId: o.userId,
                price: o.price,
                side: o.side,
                type: o.type,
                quantity: o.quantity,
                filledQuantity: o.filledQuantity,
                status: o.status
            },
            update: {
                status: o.status,
                quantity: o.quantity,
                filledQuantity: o.filledQuantity
            }
        })),
        ...trades.map((t) => prisma.trade.create({
            data: {
                id: t.id,
                price: t.price,
                quantity: t.quantity,
                marketId: t.marketId,
                buyOrderId: t.buyOrderId,
                sellOrderId: t.sellOrderId,
            },
        })),
        ...inrBalances.map((inrB) => prisma.inrBalance.update({
            where: { userId: inrB.userId },
            data: {
                available: inrB.available,
                locked: inrB.locked
            }
        })),
        // Engine may hold stock before a DB row exists (mint desync / first buy fill).
        ...stockBalances.map((sB) => prisma.stockBalance.upsert({
            where: {
                userId_marketId_side: {
                    userId: sB.userId,
                    marketId: sB.marketId,
                    side: sB.side,
                },
            },
            create: {
                userId: sB.userId,
                marketId: sB.marketId,
                side: sB.side,
                available: sB.available,
                locked: sB.locked,
            },
            update: {
                available: sB.available,
                locked: sB.locked,
            },
        }))
    ])
}
