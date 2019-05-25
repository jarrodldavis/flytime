import assert from 'assert';
import crypto from 'crypto';
import { sql } from 'squid/pg';
import { get_logger } from '../logger';
import { postgres_pool } from '../external-services';
import { DATABASE_MIGRATIONS_LOCK_TIMEOUT } from '../environment';
import migration_definitionss from './migrations';

const logger = get_logger('postgres:migrations');

function get_defined_migrations() {
	function sha256_hash(object) {
		return crypto
			.createHash('sha256')
			.update(JSON.stringify(object))
			.digest('hex');
	}

	const migrations = migration_definitionss.map((migration, index) => {
		return {
			...migration,
			id: index,
			up_sha256: sha256_hash(migration.up),
			down_sha256: sha256_hash(migration.down)
		};
	});

	logger.debug({ migrations }, 'Found migration definitions');
	return migrations;
}

async function ensure_migrations_table() {
	logger.debug('Ensuring migrations table exists...');
	const result = await postgres_pool.query(sql`
		CREATE TABLE IF NOT EXISTS migrations (
			id INT NOT NULL,
			name TEXT NOT NULL,
			up_sha256 CHAR(64) NOT NULL,
			down_sha256 CHAR(64) NOT NULL,
			applied TIMESTAMPTZ NOT NULL
		)
	`);
	logger.debug({ result }, 'Migrations table exists or has been created');
}

async function get_applied_migrations() {
	logger.debug('Retrieving applied migrations...');
	const { rows } = await postgres_pool.query(sql`
		SELECT * FROM migrations
		ORDER BY ID ASC;
	`);

	logger.debug({ migrations: rows }, 'Found applied migrations');
	return rows;
}

function validate_existing_migrations(applied, defined) {
	logger.debug('Validating applied migrations against definitions...');
	if (applied.length === 0) {
		logger.debug('No applied migrations exist, skipping');
		return;
	}

	function comparison_props({ name, up_sha256, down_sha256 }) {
		return { name, up_sha256, down_sha256 };
	}

	const actual = applied.map(comparison_props);
	const last_applied = applied[applied.length - 1].id;
	const expected = defined.slice(0, last_applied + 1).map(comparison_props);

	try {
		assert.deepStrictEqual(actual, expected);
	} catch (error) {
		logger.fatal({ error }, 'Expected applied migrations to match definitions');
		throw error;
	}

	logger.debug('All applied migrations match definitions');
}

async function apply_pending_migrations(applied_migrations, defined) {
	logger.debug('Applying pending migrations...');
	const pending = defined.slice(applied_migrations.length);

	if (pending.length === 0) {
		logger.debug('No pending migrations');
		return;
	}

	logger.debug({ migrations: pending }, 'Found pending migrations');

	for (const migration of pending) {
		logger.debug({ migration }, 'Applying pending migration...');

		const client = await postgres_pool.connect();
		await client.query(sql`BEGIN;`);
		try {
			// `SET` statements don't support parameterized queries
			// eslint-disable-next-line no-restricted-syntax
			await client.query(`
				SET LOCAL lock_timeout TO ${DATABASE_MIGRATIONS_LOCK_TIMEOUT};
			`);
			// eslint-disable-next-line no-restricted-syntax
			await client.query(migration.up);
			await client.query(sql`
				INSERT INTO migrations (id, name, up_sha256, down_sha256, applied)
				VALUES (
					${migration.id},
					${migration.name},
					${migration.up_sha256},
					${migration.down_sha256},
					CURRENT_TIMESTAMP
				);
			`);
			await client.query(sql`COMMIT;`);
		} catch (error) {
			await client.query(sql`ROLLBACK;`);
			logger.fatal({ migration, error }, 'Failed to perform migration');
			throw error;
		} finally {
			client.release();
		}

		logger.debug({ migration }, 'Migration applied successfully');
	}
}

export async function perform_migrations() {
	logger.info('Validating and applying migrations...');
	const defined = get_defined_migrations();
	await ensure_migrations_table();
	const applied = await get_applied_migrations();
	await validate_existing_migrations(applied, defined);
	await apply_pending_migrations(applied, defined);
	// TODO: hash/compare information_schema.columns
	logger.info('Successfully validated and applied migrations');
}
