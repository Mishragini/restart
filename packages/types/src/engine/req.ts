import type { OnRampInr } from "../balance"
import type { MintInput } from "../market"
import type { PlaceOrderInput } from "../order"

interface BaseReq {
    reqId: string,
    userId: string
}
interface PlaceOrderReq extends BaseReq {
    type: "place_order",
    data: PlaceOrderInput
}

interface OnRampInrReq extends BaseReq {
    type: "onramp_inr",
    data: OnRampInr
}

interface MintReq extends BaseReq {
    type: "mint",
    data: MintInput
}

export type EngineReqData = PlaceOrderInput | OnRampInr | MintInput

export type EngineReq = PlaceOrderReq | OnRampInrReq | MintReq