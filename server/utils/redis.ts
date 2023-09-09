import {Redis} from "ioredis";
require('dotenv').config();

const redisClient = () => {
    if(process.env.REDIS_DATABASE_URL){
        console.log("REDIS_DATABASE_URL connected", process.env.REDIS_DATABASE_URL);
        return process.env.REDIS_DATABASE_URL;
    }
    throw new Error("REDIS_DATABASE_URL not found || Check .env file || Redis connection failed");
}
export const redis = new Redis(redisClient());