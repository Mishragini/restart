import { prisma, MarketStatus } from "@repo/db"

export const closeExpiredMarkets = async () => {

    await prisma.market.updateMany({
        where: {
            status: MarketStatus.ACTIVE,
            endsAt: { lte: new Date() }
        },
        data: {
            status: MarketStatus.CLOSED
        }
    })

}