
import { EngineOps } from "./ops"

export type EngineReq = {
    [K in keyof EngineOps]: {
        reqId: string,
        userId: string,
        type: K
        data: EngineOps[K]["req"]
    }
}[keyof EngineOps]

export type EngineReqData = EngineReq["data"]
