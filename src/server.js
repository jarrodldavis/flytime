import { promisify } from 'util';
import os from 'os';
import polka from 'polka';
import pino_http from 'pino-http';
import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { is_development } from './common';
import { logger, GRACEFUL_SHUTDOWN, PORT } from './server/environment';
import { session_middleware, get_client_session_data } from './server/session';
import { parse_body } from './server/request-body';
import { redis_client } from './server/external-services';
import { Request } from './server/request';
import { Response } from './server/response';

logger.info('Starting up...');

function provide_overrides(req, res, next) {
	Object.setPrototypeOf(req, Request.prototype);
	Object.setPrototypeOf(res, Response.prototype);
	next();
}

const app = polka()
	.use(
		provide_overrides,
		pino_http({ logger }),
		parse_body,
		compression({ threshold: 0 }),
		sirv('static', { dev: is_development }),
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

const close_server = promisify(app.server.close).bind(app.server);
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
