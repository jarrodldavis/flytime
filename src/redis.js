import redis from 'redis';

const { REDIS_URL } = process.env;

export const redis_client = redis.createClient(REDIS_URL);

redis_client.unref();
