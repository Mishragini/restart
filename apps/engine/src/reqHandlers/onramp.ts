import type { Balance, OnRampInr } from "@repo/types/balance"
import { EngineRes } from "@repo/types/engine"

export const handleOnramp = (inrBalance: Map<string, Balance>, userId: string, data: OnRampInr): EngineRes => {
    try {
        const { amount } = data
        let existingBalance = inrBalance.get(userId)
        if (!existingBalance) {
            existingBalance = { available: 0, locked: 0 }
        }
        existingBalance.available += amount
        inrBalance.set(userId, existingBalance)
        return {
            message: `Onramp engine req successful!`,
            userId,
            type: "onramp_inr",
            data: {
                inrBalances: [{
                    userId,
                    available: existingBalance.available,
                    locked: existingBalance.locked,
                }],
            },
        }
    } catch (error) {
        console.error(error)
        return { error: "Onramp engine req failed :(" }
    }
}
