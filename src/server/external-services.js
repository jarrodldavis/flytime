import redis from 'redis';

import { REDIS_URL } from './environment';

export const redis_client = redis.createClient(REDIS_URL);
