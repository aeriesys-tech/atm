const redis = require("redis");

const redisClient = redis.createClient({
    host: "127.0.0.1",
    port: 6379,
    //   url: "redis://localhost:6379",
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Error connecting to Redis:", err.message);
    }
})();

redisClient.on("connect", () => {
    console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
    console.error("Redis error: ", err);
});

module.exports = redisClient;
