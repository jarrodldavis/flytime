import './server/shutdown'; // register handlers early
import { start as start_http } from './server/startup';
import { validate } from './server/queries/validate-models';

async function start() {
	await validate();
	start_http();
}

start();
