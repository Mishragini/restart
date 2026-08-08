import type { EngineReq, EngineRes, EngineState, Orderbook, Trade, UserStockBalance } from "@repo/types/engine";
import { handlePlaceOrder } from "./reqHandlers/order";
import type { RedisManager } from "./redisManager";
import { handleOnramp } from "./reqHandlers/onramp";
import type { Balance } from "@repo/types/balance";
import { handleMint } from "./reqHandlers/mint";
import { toSnapshot } from "./snapshot";
import { sidebookInRupees, toOrderbookLevels, tradesInRupees } from "./utils";


export class Engine {
    private static instance: Engine
    private orderbook: Orderbook
    private userInrBalance: Map<string, Balance>
    private userStockBalance: UserStockBalance
    private tradebook: Map<string, Trade[]>

    private constructor(state?: Partial<EngineState>) {
        this.orderbook = state?.orderbook ?? new Map()
        this.userInrBalance = state?.inrBalances ?? new Map()
        this.userStockBalance = state?.stockBalances ?? new Map()
        this.tradebook = state?.tradebook ?? new Map
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
                const mint_response = handleMint(this.userStockBalance, this.userInrBalance, userId, data)
                error = "error" in mint_response
                await redisManager.publishMessage(reqId, mint_response)
                break
            case "place_order": {
                const order_response = handlePlaceOrder({
                    orderbook: this.orderbook,
                    inrBalances: this.userInrBalance,
                    stockBalances: this.userStockBalance,
                    tradebook: this.tradebook,
                    userId,
                    data,
                })
                error = "error" in order_response
                await redisManager.publishMessage(reqId, order_response)
                // Only archive successful mutations via Redis Stream (durable).
                if (!("error" in order_response) && order_response.type === "place_order") {
                    await redisManager.publishToArchiver(order_response)
                    const marketBook = this.orderbook.get(data.marketId)
                    const emptySide = { bids: [], asks: [] }
                    // WS → UI: prices in rupees (internal state / archiver stay paise)
                    await redisManager.publishMessage("engine:ws", {
                        type: "market_update",
                        marketId: data.marketId,
                        orderbook: {
                            YES: sidebookInRupees(
                                marketBook
                                    ? {
                                        bids: toOrderbookLevels(marketBook.YES.bids, true),
                                        asks: toOrderbookLevels(marketBook.YES.asks, false),
                                    }
                                    : emptySide,
                            ),
                            NO: sidebookInRupees(
                                marketBook
                                    ? {
                                        bids: toOrderbookLevels(marketBook.NO.bids, true),
                                        asks: toOrderbookLevels(marketBook.NO.asks, false),
                                    }
                                    : emptySide,
                            ),
                        },
                        trades: tradesInRupees(order_response.data.trades),
                    })
                }

                break
            }
            case "get_orderbook": {
                const marketBook = this.orderbook.get(data.marketId)
                const emptySide = { bids: [], asks: [] }
                const orderbook_response: EngineRes = {
                    type: "get_orderbook",
                    message: "Orderbook fetched successfully",
                    userId,
                    data: {
                        marketId: data.marketId,
                        YES: marketBook
                            ? {
                                bids: toOrderbookLevels(marketBook.YES.bids, true),
                                asks: toOrderbookLevels(marketBook.YES.asks, false),
                            }
                            : emptySide,
                        NO: marketBook
                            ? {
                                bids: toOrderbookLevels(marketBook.NO.bids, true),
                                asks: toOrderbookLevels(marketBook.NO.asks, false),
                            }
                            : emptySide,
                    },
                }
                await redisManager.publishMessage(reqId, orderbook_response)
                break
            }
            case "get_trades": {
                const trades = this.tradebook.get(data.marketId) ?? []
                const trades_response: EngineRes = {
                    type: "get_trades",
                    message: "Trades fetched successfully",
                    userId,
                    data: {
                        marketId: data.marketId,
                        // Newest first for the panel.
                        trades: [...trades].reverse(),
                    },
                }
                await redisManager.publishMessage(reqId, trades_response)
                break
            }
            default:
                return { error: "Request not supported" };
        }

        // Read-only ops should not rewrite the snapshot
        if (!error && type !== "get_orderbook" && type !== "get_trades") {
            await redisManager.setSnapShot(toSnapshot({
                orderbook: this.orderbook,
                inrBalances: this.userInrBalance,
                stockBalances: this.userStockBalance,
                tradebook: this.tradebook
            }))
        }
    }
}