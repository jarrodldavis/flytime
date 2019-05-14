import pino from 'pino';

import { is_development } from './common';

export const logger = pino({ prettyPrint: is_development });

export const GRACEFUL_SHUTDOWN = Symbol('graceful shutdown');

const signal_handler = pino.final(logger, (signal, logger) => {
	process.emit(GRACEFUL_SHUTDOWN, logger, signal);
});

process.on('SIGTERM', signal_handler);
process.on('SIGINT', signal_handler);

const unhandled_handler = pino.final(logger, (error, logger) => {
	// It's only safe to do sync cleanup in unhandled error handlers
	// Since all graceful shutdown logic is async, just terminate
	logger.fatal(error, 'Immediately terminating due to unhandled error');
	process.exitCode = 1;
});

process.on('unhandledRejection', unhandled_handler);
process.on('uncaughtException', unhandled_handler);

process.on(
	'exit',
	pino.final(logger, (exit_code, logger) => {
		logger.info({ exit_code }, 'Exiting with code %s', exit_code);
	})
);

function get(target, prop, receiver) {
	const value = Reflect.get(target, prop, receiver);

	if (value === undefined || value === '') {
		throw new Error(`Environment variable '${prop}' is not defined`);
	}

	return value;
}

// eslint-disable-next-line no-process-env
const environment = new Proxy(process.env, { get });

// HTTP
const { PORT } = environment;

export { PORT };

// OAuth
const {
	SLACK_SIGNING_SECRET,
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
} = environment;

export {
	SLACK_SIGNING_SECRET,
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
};

export const OAUTH_STATE_SIZE = parseInt(environment.OAUTH_STATE_SIZE, 10);

// Sessions
const {
	REDIS_URL,
	SESSION_SECRET,
	MAX_SESSION_ATTEMPTS,
	COOKIE_NAME
} = environment;

export { REDIS_URL, SESSION_SECRET, MAX_SESSION_ATTEMPTS, COOKIE_NAME };
