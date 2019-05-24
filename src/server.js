import './server/shutdown'; // register handlers early
import { start as start_http } from './server/startup';
import { validate } from './server/queries/validate-models';
import { perform_migrations } from './server/queries/perform-migrations';

async function start() {
	await perform_migrations();
	await validate();
	start_http();
}

start();
