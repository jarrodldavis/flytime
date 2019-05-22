import pino from 'pino';
import { sync as uid } from 'uid-safe';
import { is_development, name, version } from '../common';

export const logger = pino({
	prettyPrint: is_development && { translateTime: true, ignore: 'package' },
	serializers: { err: pino.stdSerializers.err, error: pino.stdSerializers.err },
	redact: ['req.headers.cookie', 'res.headers["set-cookie"]'],
	base: {
		package: { name, version }
	}
});

try {
	// use `process.env` directly so that log level is set immediately
	// `pino` validates the level name so additional validation isn't needed
	logger.level = process.env.LOG_LEVEL; // eslint-disable-line no-process-env
} catch (error) {
	const exit_code = 2;
	pino
		.final(logger)
		.fatal(
			{ error, exit_code },
			'Immediately terminating due to failure to set log level'
		);
	process.exit(exit_code);
}

logger.info('Logger created and ready for use');

const client_id_symbol = Symbol('postgres client id');
export class PostgresLogger {
	#client_id_size = null;
	#pool_logger = null;
	#client_logger = null;

	static listen(pool, client_id_size) {
		new PostgresLogger(pool, client_id_size);
	}

	constructor(pool, client_id_size) {
		this.#client_id_size = client_id_size;
		this.#pool_logger = logger.child({ name: 'postgres:pool' });
		this.#client_logger = this.#pool_logger.child({ name: 'postgres:client' });

		pool
			.on('connect', this.pool_connect.bind(this))
			.on('acquire', this.pool_acquire.bind(this))
			.on('remove', this.pool_remove.bind(this))
			.on('error', this.pool_error.bind(this));
	}

	pool_connect(client) {
		const client_id = uid(this.#client_id_size);
		client[client_id_symbol] = client_id;
		this.#pool_logger.debug({ client_id }, 'New client connected to pool');

		client
			.on('notice', this.client_notice.bind(this, client))
			.on('end', this.client_end.bind(this, client))
			.on('error', this.client_error.bind(this, client));
	}

	pool_acquire(client) {
		const client_id = client[client_id_symbol];
		this.#pool_logger.debug({ client_id }, 'Client acquired from pool');
	}

	pool_remove(client) {
		const client_id = client[client_id_symbol];
		this.#pool_logger.debug({ client_id }, 'Client removed from pool');
	}

	pool_error(error, client) {
		const client_id = client[client_id_symbol];
		delete error.client;
		this.#pool_logger.error({ client_id, error }, 'Client encountered error');
	}

	translate_notice_severity(level) {
		switch (level) {
			case 'DEBUG':
				return 'debug';
			case 'LOG':
				return 'info';
			case 'INFO':
				return 'info';
			case 'NOTICE':
				return 'warn';
			case 'WARNING':
				return 'warn';
			case 'EXCEPTION':
				return 'error';
			case 'FATAL':
				return 'error';
			default:
				return 'info';
		}
	}

	client_notice(client, error) {
		const level = this.translate_notice_severity(error.severity);
		delete error.client;
		this.#client_logger[level]({ error }, 'Received message from server');
	}

	client_end(client) {
		const client_id = client[client_id_symbol];
		this.#client_logger.debug({ client_id }, 'Client disconnected');
	}

	client_error(client, error) {
		const client_id = client[client_id_symbol];
		delete error.client;
		this.#client_logger.error({ client_id, error }, 'Client encountered error');
	}
}

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
