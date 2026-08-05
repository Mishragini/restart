import { PlaceOrderInput } from "../order"

interface BaseReq {
    reqId: string
}
interface PlaceOrderReq extends BaseReq {
    data: PlaceOrderInput
}

export type EngineReqData = PlaceOrderInput

export type EngineReq = PlaceOrderReq