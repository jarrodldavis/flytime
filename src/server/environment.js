import pino from 'pino';

import { is_development } from '../common';
import { create_proxy_handler, parse_string, parse_integer } from './helpers';

// logger
export const logger = pino({
	prettyPrint: is_development && { translateTime: true },
	serializers: { err: pino.stdSerializers.err, error: pino.stdSerializers.err },
	redact: ['req.headers.cookie', 'res.headers["set-cookie"]']
});

// lifecycle management
export const GRACEFUL_SHUTDOWN = Symbol('graceful shutdown');

const signal_handler = pino.final(logger, (signal, logger) => {
	process.emit(GRACEFUL_SHUTDOWN, logger, signal);
});

process.on('SIGTERM', signal_handler);
process.on('SIGINT', signal_handler);

const unhandled_handler = pino.final(logger, (error, logger) => {
	// It's only safe to do sync cleanup in unhandled error handlers
	// Since all graceful shutdown logic is async, just terminate
	logger.fatal({ error }, 'Immediately terminating due to unhandled error');
	process.exit(1);
});

process.on('unhandledRejection', unhandled_handler);
process.on('uncaughtException', unhandled_handler);

process.on(
	'exit',
	pino.final(logger, (exit_code, logger) => {
		logger.info({ exit_code }, 'Exiting with code %s', exit_code);
	})
);

// environment variables
/* eslint-disable no-process-env */
const strings = new Proxy(process.env, create_proxy_handler(parse_string));
const integers = new Proxy(process.env, create_proxy_handler(parse_integer));
/* eslint-enable no-process-env */

// environment variables: HTTP
const { PORT } = integers;
export { PORT };

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
