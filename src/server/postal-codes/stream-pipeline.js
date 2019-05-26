import { strict as assert } from 'assert';
import { promisify } from 'util';
import { fromRandomAccessReader } from 'yauzl';
import create_csv_parser from 'csv-parse';
import { NetworkRandomAccessReader } from './network-reader';
import { get_logger } from '../logger';

const get_central_directory = promisify(fromRandomAccessReader);

export async function* get_csv_rows(zip_url, parse_options) {
	let logger = get_logger('csv-processor', { zip_url, parse_options });
	logger.info('Retrieving CSV records...');

	logger.debug('Retrieving total zip file size...');
	const reader = new NetworkRandomAccessReader(zip_url);
	const total_size = await reader.get_total_size();
	logger.debug({ total_size }, 'Got total file size');

	logger.debug({ total_size }, 'Retrieving central directory...');
	const archive = await get_central_directory(reader, total_size);
	logger.debug({ archive }, 'Got central directory');

	assert.equal(archive.entryCount, 1, 'Expected archive to have single entry');

	logger.debug({ archive }, 'Retrieving entry information...');
	const entry = await new Promise((resolve, reject) => {
		archive.once('entry', resolve);
		archive.once('error', reject);
		archive.once('end', reject);
	});
	logger = logger.child({ archive, entry });
	logger.debug('Got entry information');

	logger.debug('Preparing parser and error handlers...');
	const parser = create_csv_parser(parse_options);
	const errors = [];
	function on_error(error) {
		errors.push(error);
		parser.end();
	}
	parser.on('error', on_error);
	archive.on('error', on_error);
	logger.debug('Parser and error handlers prepared');

	logger.debug('Opening entry stream...');
	const open = promisify(archive.openReadStream).bind(archive);
	const zip_stream = await open(entry);
	zip_stream.on('error', on_error);
	logger.debug('Opened entry stream');

	logger.debug('Piping entry stream to parser...');
	zip_stream.pipe(parser);
	logger.debug('Yielding parser stream...');
	yield* parser;
	logger = logger.child({ parser_info: parser.info });
	logger.debug('Parser stream ended');

	if (errors.length > 0) {
		for (const error of errors) {
			logger.error({ error }, 'Encountered error during processing');
		}
		throw new Error('Encountered one or more errors during processing');
	}

	logger.info('Processed and yielded %s CSV records', parser.info.records);
}
