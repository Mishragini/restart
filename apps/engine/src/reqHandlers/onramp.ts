import type { Balance, OnRampInr } from "@repo/types/balance"

export const handleOnramp = (inrBalance: Map<string, Balance>, userId: string, data: OnRampInr) => {
    try {
        const { amount } = data
        let existingBalance = inrBalance.get(userId)
        if (!existingBalance) {
            existingBalance = { available: 0, locked: 0 }
        }
        existingBalance.available += amount
        inrBalance.set(userId, existingBalance)
        return { message: `Onramp engine req successful!`, data: existingBalance }
    } catch (error) {
        console.error(error)
        return { error: "Onramp engine req failed :(" }
    }
}