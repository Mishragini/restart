import { prisma } from "@repo/db"
import { MarketStatus } from "@repo/types/market"

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