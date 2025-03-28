import RedisStore from "connect-redis";
import { createClient } from "redis";
import { REDIS_URL } from "../utils/config";


export const createRedisStore = async ()=>{
    try{
        console.log(`=== REDIS_URL:${REDIS_URL}`)
        const redisClient = createClient({url: REDIS_URL})
        await redisClient.connect()
        const redisStore = new RedisStore({
            client:redisClient,
            prefix: "sessionServer:"
        })

        return redisStore

    }catch(err){
        throw new Error(`connect redis error, message: ${err}`)
    }
    
}
