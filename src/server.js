import { shutdown_gracefully } from './server/shutdown'; // register handlers early
import { get_logger } from './server/logger';
import { perform_migrations } from './server/queries/perform-migrations';
import { validate_models } from './server/queries/validate-models';
import { start_http } from './server/http';

const logger = get_logger('startup');

async function start() {
	try {
		await perform_migrations();
		await validate_models();
		await start_http();
	} catch (error) {
		logger.fatal({ error }, 'Failed to start server');
		await shutdown_gracefully();
	}
}

start();
