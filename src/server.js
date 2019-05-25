import './server/shutdown'; // register handlers early
import { perform_migrations } from './server/queries/perform-migrations';
import { validate_models } from './server/queries/validate-models';
import { start_http } from './server/http';

async function start() {
	await perform_migrations();
	await validate_models();
	start_http();
}

start();
