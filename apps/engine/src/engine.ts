import type { EngineReq, EngineState, Orderbook, UserStockBalance } from "@repo/types/engine";
// import { handlePlaceOrder } from "./reqHandlers/order";
import type { RedisManager } from "./redisManager";
import { handleOnramp } from "./reqHandlers/onramp";
import type { Balance } from "@repo/types/balance";
import { handleMint } from "./reqHandlers/mint";
import { toSnapshot } from "./snapshot";

export class Engine {
    private static instance: Engine
    private orderbook: Orderbook
    private userInrBalance: Map<string, Balance>
    private userStockBalance: UserStockBalance

    private constructor(state?: Partial<EngineState>) {
        this.orderbook = state?.orderbook ?? new Map()
        this.userInrBalance = state?.inrBalances ?? new Map()
        this.userStockBalance = state?.stockBalances ?? new Map()
    }

    static getInstance(state?: Partial<EngineState>) {
        if (!this.instance) {
            this.instance = new Engine(state)
        }
        return this.instance
    }

    async processReq(redisManager: RedisManager, message: string) {
        const { reqId, userId, type, data } = JSON.parse(message) as EngineReq

        let error = false;
        switch (type) {
            case "onramp_inr":
                const onramp_response = handleOnramp(this.userInrBalance, userId, data)
                error = "error" in onramp_response
                await redisManager.publishMessage(reqId, onramp_response)
                break
            case "mint":
                const mint_response = handleMint(this.userStockBalance, userId, data)
                error = "error" in mint_response
                await redisManager.publishMessage(reqId, mint_response)
                break
            // case "place_order":
            //     const order_response = handlePlaceOrder(this.orderbook, data)
            //     redisManager.publishMessage(reqId, order_response)
            //     //publish to ws as well
            //     break

            default:
                return { error: "Request not supported'" };
        }

        if (!error) {
            await redisManager.setSnapShot(toSnapshot({
                orderbook: this.orderbook,
                inrBalances: this.userInrBalance,
                stockBalances: this.userStockBalance
            }))
        }
    }
}