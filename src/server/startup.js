import { promisify } from 'util';
import { createServer } from 'http';
import polka from 'polka';
import { json, urlencoded } from '@polka/parse';
import pino_http from 'pino-http';
import sirv from 'sirv';
import * as sapper from '@sapper/server';

import { is_development, timeout } from '../common';
import { PORT, SHUTDOWN_SERVER_TIMEOUT } from './environment';
import { logger } from './logger';
import { register_graceful_shutdown } from './shutdown';
import { session_middleware, get_client_session_data } from './session';
import { Request } from './request';
import { Response } from './response';
import { negotiate_content } from './content-negotiation';
import { error_handler } from './error-handler';

const app = polka({
	server: createServer({ IncomingMessage: Request, ServerResponse: Response }),
	onError: error_handler
}).use(
	pino_http({ logger, name: 'http' }),
	negotiate_content,
	json(),
	urlencoded(),
	sirv('static', { dev: is_development }),
	session_middleware,
	sapper.middleware({ session: get_client_session_data })
);

const close_server = promisify(app.server.close).bind(app.server);
register_graceful_shutdown(async logger => {
	logger.info('Closing HTTP server...');
	try {
		await Promise.race([close_server(), timeout(SHUTDOWN_SERVER_TIMEOUT)]);
		logger.info('Successfully closed HTTP server');
	} catch (error) {
		logger.error({ error }, 'Failed to close HTTP server');
	}
});

export function start() {
	logger.info('Starting HTTP server...');
	app.listen(PORT, error => {
		if (error) {
			logger.fatal({ error }, 'Error starting HTTP server');
		} else {
			logger.info(`HTTP server started and listening on port ${PORT}`);
		}
	});
}
