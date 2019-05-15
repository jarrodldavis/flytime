import { promisify } from 'util';
import os from 'os';
import express from 'express';
import express_pino from 'express-pino-logger';
import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { slack_middleware, slack_client } from './slack';
import { is_development } from './common';
import { session_middleware, get_client_session_data } from './server/session';
import { redis_client } from './server/external-services';
import { logger, GRACEFUL_SHUTDOWN, PORT } from './server/environment';

logger.info('Starting up...');

function provide_request_id(req, _res, next) {
	req.id = req.id || req.header('x-request-id');
	next();
}

function provide_slack_client(req, _res, next) {
	req.slack_client = slack_client;
	next();
}

const server = express()
	.set('trust proxy', true)
	.use(
		provide_request_id,
		express_pino({ logger }),
		slack_middleware,
		compression({ threshold: 0 }),
		sirv('static', { dev: is_development }),
		provide_slack_client,
		session_middleware,
		sapper.middleware({ session: get_client_session_data })
	)
	.listen(PORT, error => {
		if (error) {
			logger.fatal({ error }, 'Error starting HTTP server');
		} else {
			logger.info(`HTTP server started and listening on port ${PORT}`);
		}
	});

const close_server = promisify(server.close).bind(server);
const quit_redis = promisify(redis_client.quit).bind(redis_client);

let shutting_down = false;
async function graceful_shutdown(logger, signal) {
	logger.info({ signal }, `Received ${signal}`);

	if (shutting_down) {
		logger.warn('Already shutting down, ignoring signal');
		return;
	}

	shutting_down = true;

	logger.info('Closing HTTP server...');
	try {
		await close_server();
		logger.info('Successfully closed HTTP server');
	} catch (error) {
		logger.error({ error }, 'Failed to close HTTP server');
	}

	logger.info('Quitting Redis connection...');
	try {
		await quit_redis();
		logger.info('Successfully quit Redis connection');
	} catch (error) {
		logger.error({ error }, 'Failed to quit Redis connection');
	}

	logger.info('Completed shutdown successfully');

	let exit_code = 1;
	if (signal) {
		const signal_code = os.constants.signals[signal];
		if (signal_code) {
			exit_code = 128 + signal_code;
		}
	}

	process.exit(exit_code);
}

process.on(GRACEFUL_SHUTDOWN, graceful_shutdown);
