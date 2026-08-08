import { performDBMutation } from "./archiver"
import { RedisManager } from "./redisManager"

async function main() {
    // Blocks forever, reading engine mutations from the Redis stream
    await RedisManager.getInstance().listen(performDBMutation)
}

main()
