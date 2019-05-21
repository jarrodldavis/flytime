import os from 'os';

// environment variables
export function create_proxy_handler(transform) {
	return {
		get(target, property, receiver) {
			const value = Reflect.get(target, property, receiver);
			if (value === undefined) {
				throw new Error(`Environment variable '${property}' is not defined`);
			}

			const transformed = transform(value);
			if (transformed === null) {
				throw new Error(`Environment variable '${property}' is invalid`);
			}

			return transformed;
		}
	};
}

export function parse_string(value) {
	const parsed = value.trim();
	if (parsed.trim() === '') {
		return null;
	}

	return parsed;
}

export function parse_integer(value) {
	const parsed = parseInt(value, 10);
	if (isNaN(parsed) || parsed.toString() !== value) {
		return null;
	}

	return parsed;
}

// shutdown
const handlers = [];
export function register_graceful_shutdown(handler) {
	handlers.push(handler);
}

let shutting_down = false;
export async function signal_handler(signal, logger) {
	logger.info({ signal }, `Received ${signal}`);

	if (shutting_down) {
		logger.warn('Already shutting down, ignoring signal');
		return;
	}

	shutting_down = true;

	for (const handler of handlers.reverse()) {
		await handler(logger);
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

export function unhandled_handler(error, logger) {
	// It's only safe to do sync cleanup in unhandled error handlers
	// Since all graceful shutdown logic is async, just terminate
	logger.fatal({ error }, 'Immediately terminating due to unhandled error');
	process.exit(1);
}

export function exit_handler(exit_code, logger) {
	const level = exit_code === 0 ? 'info' : 'warn';
	logger[level]({ exit_code }, 'Exiting with code %s', exit_code);
}
