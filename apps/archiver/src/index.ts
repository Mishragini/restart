import { performDBMutation } from "./archiver"
import { RedisManager } from "./redisManager"

async function main() {
    await RedisManager.getInstance().subscribe(performDBMutation)
}

main()