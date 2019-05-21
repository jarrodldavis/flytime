import { promisify } from 'util';
import { createServer } from 'http';
import polka from 'polka';
import { json, urlencoded } from '@polka/parse';
import pino_http from 'pino-http';
import sirv from 'sirv';
import * as sapper from '@sapper/server';

import { is_development, timeout } from './common';
import { logger, PORT, SHUTDOWN_SERVER_TIMEOUT } from './server/environment';
import { register_graceful_shutdown } from './server/helpers';
import { session_middleware, get_client_session_data } from './server/session';
import { Request } from './server/request';
import { Response } from './server/response';
import { negotiate_content } from './server/content-negotiation';
import { error_handler } from './server/error-handler';

logger.info('Starting up...');

const app = polka({
	server: createServer({ IncomingMessage: Request, ServerResponse: Response }),
	onError: error_handler
})
	.use(
		pino_http({ logger }),
		negotiate_content,
		json(),
		urlencoded(),
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
register_graceful_shutdown(async logger => {
	logger.info('Closing HTTP server...');
	try {
		await Promise.race([close_server(), timeout(SHUTDOWN_SERVER_TIMEOUT)]);
		logger.info('Successfully closed HTTP server');
	} catch (error) {
		logger.error({ error }, 'Failed to close HTTP server');
	}
});
