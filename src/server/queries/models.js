import { defineTable, Schema } from 'squid/pg';

export const information_schema_columns = defineTable('columns', {
	table_schema: Schema.String,
	table_name: Schema.String,
	column_name: Schema.String,
	column_default: Schema.String,
	is_nullable: Schema.String, // TODO: ENUM ('YES', 'NO')
	data_type: Schema.String
});

export const migrations = defineTable('migrations', {
	id: Schema.Number,
	name: Schema.String,
	up_sha256: Schema.String,
	down_sha256: Schema.String,
	applied: Schema.Date
});
