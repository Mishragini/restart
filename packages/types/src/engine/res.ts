import { EngineOps } from "./ops";


export type EngineSuccessRes = {
    [K in keyof EngineOps]: {
        type: K,
        message: string,
        userId: string,
        data: EngineOps[K]["res"]
    }
}[keyof EngineOps]

export type EngineRes = EngineSuccessRes | { error: string }