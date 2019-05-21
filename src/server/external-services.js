import { promisify } from 'util';
import redis from 'redis';
import { WebClient } from '@slack/web-api';

import { timeout } from '../common';
import { REDIS_URL, SHUTDOWN_REDIS_TIMEOUT } from './environment';
import { register_graceful_shutdown } from './helpers';

export const redis_client = redis.createClient(REDIS_URL);

export const slack_client = new WebClient();

const quit_redis = promisify(redis_client.quit).bind(redis_client);
register_graceful_shutdown(async logger => {
	logger.info('Quitting Redis connection...');
	try {
		await Promise.race([quit_redis(), timeout(SHUTDOWN_REDIS_TIMEOUT)]);
		logger.info('Successfully quit Redis connection');
	} catch (error) {
		logger.error({ error }, 'Failed to quit Redis connection');
	}
});
