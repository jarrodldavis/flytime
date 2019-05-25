import os from 'os';
import pino from 'pino';
import { get_logger } from './logger';

const logger = get_logger('shutdown');

logger.info('Registering shutdown handlers...');

const handlers = [];
export function register_graceful_shutdown(handler) {
	if (!handler.name) {
		const message = 'Graceful shutdown handler has no name';
		logger.warn({ error: new Error(message) }, message);
	}
	handlers.push(handler);
}

let shutting_down = false;
async function signal_handler(signal, logger) {
	logger.info({ signal }, `Received ${signal}`);

	if (shutting_down) {
		logger.warn('Already shutting down, ignoring signal');
		return;
	}

	shutting_down = true;

	for (const handler of handlers.reverse()) {
		const name = `shutdown:${handler.name || 'handler'}`;
		await handler(logger.child({ name }));
	}

	logger.info('Completed shutdown');
	let exit_code = 1;
	if (signal) {
		const signal_code = os.constants.signals[signal];
		if (signal_code) {
			// replicate node's default exit code behavior for signals
			exit_code = 128 + signal_code;
		}
	}

	process.exit(exit_code);
}

function unhandled_handler(error, logger) {
	// It's only safe to do sync cleanup in unhandled error handlers
	// Since all graceful shutdown logic is async, just terminate
	logger.fatal({ error }, 'Immediately terminating due to unhandled error');
	process.exit(1);
}

function exit_handler(exit_code, logger) {
	const level = exit_code === 0 ? 'info' : 'warn';
	logger[level]({ exit_code }, 'Exiting with code %s', exit_code);
}

process.on('SIGTERM', pino.final(logger, signal_handler));
process.on('SIGINT', pino.final(logger, signal_handler));
process.on('unhandledRejection', pino.final(logger, unhandled_handler));
process.on('uncaughtException', pino.final(logger, unhandled_handler));
process.on('exit', pino.final(logger, exit_handler));

logger.info('Shutdown handlers successfully registered');
