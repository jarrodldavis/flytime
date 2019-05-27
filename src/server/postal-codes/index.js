import { postal_codes } from '../queries/models';
import { get_logger } from '../logger';
import { get_zip_entry } from './get-file-stream';
import create_csv_parser from 'csv-parse';

const ZIP_URL = 'https://download.geonames.org/export/zip/allCountries.zip';
const PARSE_OPTIONS = {
	columns: Object.keys(postal_codes.columns),
	delimiter: '\t',
	quote: false
};

export async function* get_postal_codes() {
	let logger = get_logger('ingest-postal-codes');
	logger.info('Retrieving postal codes');

	const parser = create_csv_parser(PARSE_OPTIONS);

	logger.debug('Retrieving zip entry stream');
	const entry_stream = await get_zip_entry(ZIP_URL);
	logger.debug('Got zip entry stream');

	let entry_error;
	entry_stream.on('error', error => {
		entry_error = error;
		parser.end();
	});

	logger.debug('Piping entry stream to parser and yielding');
	yield* entry_stream.pipe(parser);
	logger = logger.child({ parser_info: parser.info });
	logger.debug('Parser stream ended');

	if (entry_error) {
		logger.error({ error: entry_error }, 'Encountered error during processing');
		throw entry_error;
	}

	logger.info('Processed and yielded %s CSV records', parser.info.records);
}
