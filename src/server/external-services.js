import { promisify } from 'util';
import redis from 'redis';
import { Pool } from 'pg';
import { WebClient, addAppMetadata } from '@slack/web-api';

import { timeout, name, version, is_production } from '../common';
import {
	REDIS_URL,
	SHUTDOWN_REDIS_TIMEOUT,
	DATABASE_URL,
	DATABASE_CONNECT_TIMEOUT,
	DATABASE_STATEMENT_TIMEOUT,
	DATABASE_CLIENT_ID_SIZE,
	SHUTDOWN_DATABASE_TIMEOUT
} from './environment';
import { register_graceful_shutdown } from './shutdown';
import { SlackPinoLogger, PostgresLogger } from './logger';

export const redis_client = redis.createClient(REDIS_URL);

export const postgres_pool = new Pool({
	connectionString: DATABASE_URL,
	ssl: is_production,
	connectionTimeoutMillis: DATABASE_CONNECT_TIMEOUT,
	statement_timeout: DATABASE_STATEMENT_TIMEOUT
});

export const slack_client = new WebClient(undefined, {
	logger: new SlackPinoLogger()
});

addAppMetadata({ name, version });

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

PostgresLogger.listen(postgres_pool, DATABASE_CLIENT_ID_SIZE);

register_graceful_shutdown(async logger => {
	logger.info('Ending Postgres pool...');
	try {
		await Promise.race([
			postgres_pool.end(),
			timeout(SHUTDOWN_DATABASE_TIMEOUT)
		]);
		logger.info('Successfully ended Postgres pool');
	} catch (error) {
		logger.error({ error }, 'Failed to end Postgres pool');
	}
});
