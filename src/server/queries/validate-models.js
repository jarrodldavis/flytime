import assert from 'assert';
import { getAllTableSchemas, sql, ColumnType } from 'squid/pg';
import { information_schema_columns } from './models'; // add table definitions
import { postgres_pool } from '../external-services';
import { logger } from '../logger';

function translate_type(database_type) {
	switch (database_type) {
		// types mentioned by squid.SchemaTypes
		case 'boolean': // BOOLEAN
			return ColumnType.Boolean;
		case 'date': // DATE
		case 'timestamp without time zone': // TIMESTAMP
			return ColumnType.Date;
		case 'integer': // INTEGER
		case 'smallint': // SMALLINT
		case 'bigint': // BIGINT
		case 'double precision': // FLOAT
		case 'real': // REAL
		case 'numeric': // NUMERIC
			return ColumnType.Number;
		case 'character': // CHAR
		case 'character varying': // VARCHAR
		case 'text': // TEXT
			return ColumnType.String;

		// additional types
		case 'uuid': // UUID
			return ColumnType.String;
		case 'timestamp with time zone': // TIMESTAMPTZ
			return ColumnType.Date;

		default:
			return ColumnType.Any;
	}
}

function translate_column(column_details) {
	const column = {
		type: translate_type(column_details.data_type)
	};

	if (column_details.column_default !== null) {
		column.hasDefault = true;
	}

	if (column_details.is_nullable === 'YES') {
		column.hasDefault = true; // nullable columns have implicit DEFAULT NULL
		column.nullable = true;
	}

	return column;
}

async function get_database_tables() {
	const columns_result = await postgres_pool.query(sql`
		SELECT table_name, column_name, column_default, is_nullable, data_type
		FROM information_schema.columns
		WHERE table_schema = 'public'
	`);

	const tables = {};

	for (const column_details of columns_result.rows) {
		const table = tables[column_details.table_name] || {};
		table[column_details.column_name] = translate_column(column_details);
		tables[column_details.table_name] = table;
	}

	return tables;
}

export async function validate() {
	logger.info('Validating defined model schemas against database tables...');

	const expected_tables = getAllTableSchemas().reduce((tables, table) => {
		if (table !== information_schema_columns) {
			tables[table.name] = table.columns;
		}
		return tables;
	}, {});

	const actual_tables = await get_database_tables();

	try {
		assert.deepStrictEqual(actual_tables, expected_tables);
	} catch (error) {
		logger.fatal({ error }, 'Expected database tables to match defined models');
		throw error;
	}

	logger.info('All database tables match defined model schemas');
}
