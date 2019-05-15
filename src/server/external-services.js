import redis from 'redis';
import { WebClient } from '@slack/web-api';

import { REDIS_URL } from './environment';

export const redis_client = redis.createClient(REDIS_URL);

export const slack_client = new WebClient();
