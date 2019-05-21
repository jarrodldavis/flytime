import pino from 'pino';
import { is_development, name, version } from '../common';

// use `process.env` directly so that log level is set immediately
// `pino` validates the level name so additional validation isn't needed
const level = process.env.LOG_LEVEL; // eslint-disable-line no-process-env

export const logger = pino({
	level,
	prettyPrint: is_development && { translateTime: true },
	serializers: { err: pino.stdSerializers.err, error: pino.stdSerializers.err },
	redact: ['req.headers.cookie', 'res.headers["set-cookie"]'],
	base: {
		package: { name, version }
	}
});

logger.info('Logger created and ready for use');

export class SlackPinoLogger {
	#logger;
	#name = 'slack';

	constructor() {
		this.#logger = logger.child({ name: this.#name });
	}

	setLevel(level) {
		this.#logger.level = level;
	}

	setName(name) {
		this.#name = `slack:${name}`;
	}

	debug(...args) {
		this.#logger.debug({ name: this.#name }, ...args);
	}

	info(...args) {
		this.#logger.info({ name: this.#name }, ...args);
	}

	warn(...args) {
		this.#logger.warn({ name: this.#name }, ...args);
	}

	error(...args) {
		this.#logger.error({ name: this.#name }, ...args);
	}
}
