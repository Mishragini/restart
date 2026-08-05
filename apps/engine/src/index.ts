import { RedisManager } from "./redisManager"

async function main() {
    await RedisManager.getInstance().processReq()
}

main()