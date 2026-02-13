//This file initializes the connection to your Upstash database.
import { Redis } from "@upstash/redis";

// Initialize Redis client
// Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are in .env.local
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
