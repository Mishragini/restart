import type { Balance } from "@repo/types/balance";
import type { EngineRes, UserStockBalance } from "@repo/types/engine";
import type { MintInput } from "@repo/types/market";
import { getInr, getStock, MINT_COST_PER_PAIR_PAISE } from "../utils";

export const handleMint = (
    stockBalance: UserStockBalance,
    inrBalances: Map<string, Balance>,
    userId: string,
    data: MintInput,
): EngineRes => {
    try {
        const { amount, marketId } = data;
        const cost = amount * MINT_COST_PER_PAIR_PAISE;
        const inr = getInr(inrBalances, userId);

        if (inr.available < cost) {
            return { error: "Insufficient INR balance" };
        }
        inr.available -= cost;

        const yes = getStock(stockBalance, userId, marketId, "YES");
        const no = getStock(stockBalance, userId, marketId, "NO");
        yes.available += amount;
        no.available += amount;

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
                        available: yes.available,
                        locked: yes.locked,
                    },
                    {
                        userId,
                        marketId,
                        side: "NO",
                        available: no.available,
                        locked: no.locked,
                    },
                ],
                inrBalances: [
                    {
                        userId,
                        available: inr.available,
                        locked: inr.locked,
                    },
                ],
            },
        };
    } catch (error) {
        console.error(error);
        return { error: "Mint engine req failed :(" };
    }
};
