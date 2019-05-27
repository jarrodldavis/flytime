import { sql } from 'squid/pg';
import { from as copy } from 'pg-copy-streams';
import { postgres_pool } from '../external-services';
import { get_logger } from '../logger';

const logger = get_logger('query:import-postal-codes');

// '\b' is a backspace character (ASCII 8)
// This effectively disables Postgres' quote processing
const copy_query = `
	COPY postal_codes_import
	FROM STDIN
	WITH (
		FORMAT 'csv',
		DELIMITER '\t',
		NULL '',
		QUOTE '\b',
		FORCE_NOT_NULL ('place_name')
	);
`;

export async function import_postal_codes(file_stream) {
	logger.info('Importing postal codes from file stream...');

	const file_promise = new Promise((resolve, reject) => {
		file_stream.once('end', resolve);
		file_stream.once('error', reject);
	});

	logger.debug('Retrieving Postgres client...');
	const client = await postgres_pool.connect();
	logger.debug('Got Postgres client');

	logger.debug('Starting transaction...');
	await client.query(sql`BEGIN;`);
	logger.debug('Started transaction');

	try {
		logger.debug('Preparing import table...');
		await client.query(sql`
			DROP TABLE IF EXISTS postal_codes_import;
		`);
		await client.query(sql`
			CREATE TABLE postal_codes_import (
				LIKE postal_codes
				INCLUDING ALL
			);
		`);
		logger.debug('Import table prepared');

		logger.debug('Creating `COPY` stream....');
		// eslint-disable-next-line no-restricted-syntax
		const copy_stream = client.query(copy(copy_query));
		const copy_promise = new Promise((resolve, reject) => {
			copy_stream.once('finish', resolve);
			copy_stream.once('error', reject);
		});
		logger.debug('`COPY` stream created');

		logger.debug('Piping file stream to copy stream....');
		file_stream.pipe(copy_stream);
		await Promise.all([file_promise, copy_promise]);
		logger.debug('File and copy streams finished');

		logger.debug('Exchanging tables...');
		await client.query(sql`
			DROP TABLE postal_codes;
		`);

		await client.query(sql`
			ALTER TABLE postal_codes_import
			RENAME TO postal_codes;
		`);
		logger.debug('Tables exchanged');

		logger.debug('Committing transaction');
		await client.query(sql`COMMIT;`);
		logger.debug('Transaction committed');

		logger.info('Imported postal codes successfully');
	} catch (error) {
		logger.error({ error }, 'Encountered error during processing');
		logger.debug('Rolling back transaction...');
		await client.query(sql`ROLLBACK;`);
		logger.debug('Transaction rolled back');
		throw error;
	} finally {
		client.release();
	}

	// `VACUUM` must be performed outside of transaction blocks
	logger.info('Vacuumming newly imported data...');
	const result = await postgres_pool.query(sql`
		VACUUM ANALYZE postal_codes;
	`);
	logger.info({ result }, 'Vacuum completed successfully');
}
