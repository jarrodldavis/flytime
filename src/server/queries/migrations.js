import { sql } from 'squid/pg';

export default [
	{
		name: 'enable_uuid',
		up: sql`
			CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
		`,
		down: sql`
			DROP EXTENSION IF EXISTS "uuid-ossp";
		`
	},
	{
		name: 'create_test_table',
		up: sql`
			CREATE TABLE IF NOT EXISTS test_table (
				id UUID DEFAULT uuid_generate_v4(),
				message TEXT NOT NULL,
				cool TEXT,
				CONSTRAINT pkey_test_table PRIMARY KEY (id)
			);
		`,
		down: sql`
			DROP TABLE IF EXISTS test_table;
		`
	}
];
