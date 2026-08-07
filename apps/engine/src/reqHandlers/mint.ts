import type { EngineRes, UserStockBalance } from "@repo/types/engine";
import type { MintInput } from "@repo/types/market";

export const handleMint = (stockBalance: UserStockBalance, userId: string, data: MintInput): EngineRes => {
    try {
        const { amount, marketId } = data
        let userMarkets = stockBalance.get(userId)
        if (!userMarkets) {
            userMarkets = new Map()
            stockBalance.set(userId, userMarkets)
        }

        let existing = userMarkets.get(marketId)
        if (!existing) {
            existing = {
                YES: { available: 0, locked: 0 },
                NO: { available: 0, locked: 0 }
            }
            userMarkets.set(marketId, existing)
        }
        existing.YES.available += amount
        existing.NO.available += amount

        return {
            message: "Mint engine req successful!",
            type: "mint",
            userId,
            data: {
                stockBalances: [
                    {
                        userId,
                        marketId,
                        side: "YES",
                        available: existing.YES.available,
                        locked: existing.YES.locked,
                    },
                    {
                        userId,
                        marketId,
                        side: "NO",
                        available: existing.NO.available,
                        locked: existing.NO.locked,
                    },
                ],
            },
        }
    } catch (error) {
        console.error(error)
        return { error: "Mint engine req failed :(" }
    }
}
