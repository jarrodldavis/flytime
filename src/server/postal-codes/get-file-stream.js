import { strict as assert } from 'assert';
import { promisify } from 'util';
import { fromRandomAccessReader } from 'yauzl';
import { NetworkRandomAccessReader } from './network-reader';
import { get_logger } from '../logger';

const get_central_directory = promisify(fromRandomAccessReader);

export async function get_zip_entry(zip_url) {
	let logger = get_logger('zip-downloader', { zip_url });
	logger.info('Retrieving ZIP entry...');

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

	logger.debug('Opening entry stream...');
	const open = promisify(archive.openReadStream).bind(archive);
	const zip_stream = await open(entry);
	logger.debug('Successfully opened entry stream');

	return zip_stream;
}
