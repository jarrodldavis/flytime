import pino from 'pino';
import { is_development, name, version } from '../common';

export const logger = pino({
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
