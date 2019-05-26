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
		name: 'add_postal_codes',
		up: sql`
			CREATE TABLE IF NOT EXISTS postal_codes (
				country_code   CHAR(2)      NOT NULL,
				postal_code    VARCHAR(20)  NOT NULL,
				place_name     VARCHAR(180) NOT NULL,
				state_name     VARCHAR(100) NOT NULL,
				state_code     VARCHAR(20)  NOT NULL,
				county_name    VARCHAR(100) NOT NULL,
				county_code    VARCHAR(20)  NOT NULL,
				community_name VARCHAR(100) NOT NULL,
				community_code VARCHAR(20)  NOT NULL,
				latitude       NUMERIC      NOT NULL,
				longitude      NUMERIC      NOT NULL,
				accuracy       SMALLINT     NOT NULL
			);
		`,
		down: sql`
			DROP TABLE IF EXISTS postal_codes;
		`
	}
];
