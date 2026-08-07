import { Redis } from "ioredis";

export const redis = new Redis({
    host: (process.env.REDIS_HOST || "127.0.0.1") as string,
    port: (process.env.REDIS_PORT || 6379) as number,
    maxRetriesPerRequest: null
    // password field is required in production
    // Use tls for redis services
});

redis.on("connect", () => console.log("Redis server connected successfully"));
redis.on("error", (err) => console.log("Error connecting redis: ", err));
