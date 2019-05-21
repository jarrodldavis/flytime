import pino from 'pino';

import { is_development } from '../common';
import {
	signal_handler,
	unhandled_handler,
	exit_handler,
	create_proxy_handler,
	parse_string,
	parse_integer
} from './helpers';

// logger
export const logger = pino({
	prettyPrint: is_development && { translateTime: true },
	serializers: { err: pino.stdSerializers.err, error: pino.stdSerializers.err },
	redact: ['req.headers.cookie', 'res.headers["set-cookie"]']
});

// lifecycle management
// registration is located here to ensure they are registered early
// otherwise, bundling may put other logic before these handlers
process.on('SIGTERM', pino.final(logger, signal_handler));
process.on('SIGINT', pino.final(logger, signal_handler));
process.on('unhandledRejection', pino.final(logger, unhandled_handler));
process.on('uncaughtException', pino.final(logger, unhandled_handler));
process.on('exit', pino.final(logger, exit_handler));

// environment variables
/* eslint-disable no-process-env */
const strings = new Proxy(process.env, create_proxy_handler(parse_string));
const integers = new Proxy(process.env, create_proxy_handler(parse_integer));
/* eslint-enable no-process-env */

// environment variables: HTTP
const { PORT } = integers;
export { PORT };

// environment variables: Shutdown
const { SHUTDOWN_SERVER_TIMEOUT, SHUTDOWN_REDIS_TIMEOUT } = integers;
export { SHUTDOWN_SERVER_TIMEOUT, SHUTDOWN_REDIS_TIMEOUT };

// environment variables: Webhook Payload Signing
const { SLACK_SIGNING_SECRET } = strings;
const { SLACK_SIGNING_RANDOM_KEY_SIZE } = integers;
export { SLACK_SIGNING_SECRET, SLACK_SIGNING_RANDOM_KEY_SIZE };

// environment variables: OAuth
const {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
} = strings;

const { OAUTH_STATE_SIZE } = integers;

export {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET,
	OAUTH_STATE_SIZE
};

// environment variables: Sessions
const { REDIS_URL, SESSION_SECRET, COOKIE_NAME } = strings;
const { MAX_SESSION_ATTEMPTS } = integers;
export { REDIS_URL, SESSION_SECRET, COOKIE_NAME, MAX_SESSION_ATTEMPTS };
