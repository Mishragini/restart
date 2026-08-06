import type { EngineRes, UserStockBalance } from "@repo/types/engine";
import type { MintInput } from "@repo/types/market";

export const handleMint = (stockBalance: UserStockBalance, userId: string, data: MintInput): EngineRes => {
    try {
        const { amount, marketId } = data
        let existing = stockBalance.get(userId)?.get(marketId)
        if (!existing) {
            existing = {
                YES: { available: 0, locked: 0 },
                NO: { available: 0, locked: 0 }
            }
        }
        existing.YES.available += amount
        existing.NO.available += amount
        const marketBalance = new Map()
        marketBalance.set(marketId, existing)
        stockBalance.set(userId, marketBalance)
        return { message: "Mint engine req successful!", data: existing }
    } catch (error) {
        console.error(error)
        return { error: "Mint engine req failed :(" }
    }
}