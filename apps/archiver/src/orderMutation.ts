import { prisma } from "@repo/db";
import { PlaceOrderRes } from "@repo/types/engine";

export const orderMutation = async (
    _userId: string,
    data: PlaceOrderRes,
) => {
    const { orders, inrBalances, stockBalances } = data
    await prisma.$transaction([
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
        ...inrBalances.map((inrB) => prisma.inrBalance.update({
            where: { userId: inrB.userId },
            data: {
                available: inrB.available,
                locked: inrB.locked
            }
        })),
        ...stockBalances.map((sB) => prisma.stockBalance.update({
            where: {
                userId_marketId_side: {
                    userId: sB.userId,
                    marketId: sB.marketId,
                    side: sB.side,
                },
            },
            data: {
                available: sB.available,
                locked: sB.locked,
            },
        }))
    ])
}

