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
	}
];
