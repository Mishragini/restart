import type { Balance, OnRampInr } from "@repo/types/balance"
import { EngineRes } from "@repo/types/engine"
import { getInr } from "../utils"

export const handleOnramp = (inrBalance: Map<string, Balance>, userId: string, data: OnRampInr): EngineRes => {
    try {
        const { amount } = data
        const existingBalance = getInr(inrBalance, userId)
        existingBalance.available += amount
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
