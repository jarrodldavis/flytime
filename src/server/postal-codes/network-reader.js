import https from 'https';
import { Readable } from 'stream';
import { RandomAccessReader } from 'yauzl';
import { get_logger } from '../logger';
import { ResponseValidator } from './response-validator';

function outgoing_request_serializer(req) {
	return {
		method: req.method,
		path: req.path,
		headers: req.getHeaders()
	};
}

function incoming_response_serializer(res) {
	const connection = res.connection;
	return {
		headers: res.headers,
		statusCode: res.statusCode,
		remoteAddress: connection && connection.remoteAddress,
		remotePort: connection && connection.remotePort
	};
}

const HTTP_SERIALIZERS = {
	req: outgoing_request_serializer,
	res: incoming_response_serializer
};

const SUPPORTED_PROTOCOL = https.globalAgent.protocol;

export class NetworkRandomAccessReader extends RandomAccessReader {
	#url;
	#logger;
	#total_size;

	constructor(url) {
		super();
		this.#url = new URL(url);

		const protocol = this.#url.protocol;
		if (protocol !== SUPPORTED_PROTOCOL) {
			throw new Error(`Unsupported protocol: ${protocol}`);
		}

		this.#logger = get_logger('yauzl:network-reader', {
			zip_url: this.#url,
			serializers: HTTP_SERIALIZERS
		});
	}

	async get_total_size() {
		this.#logger.debug('Requesting total size of zip file...');

		let total = this.#total_size;
		if (total) {
			this.#logger.debug({ total }, 'Total size already calculated');
			return total;
		}

		const options = { method: 'HEAD' };

		let req;
		const res = await new Promise((resolve, reject) => {
			req = https.request(this.#url, options, resolve);
			this.#logger.debug({ req }, 'Sending request...');
			req.once('error', reject).end();
		});

		this.#logger.debug({ req, res }, 'Got response, validating metadata...');
		const validator = new ResponseValidator(res);
		validator.expect_status(200);
		validator.expect_accept_ranges();
		total = validator.expect_content_length();
		validator.expect_content_type();

		this.#logger.debug({ req, res, total }, 'Retrieved total zip file size');
		this.#total_size = total;
		return total;
	}

	async *request_range(start, end) {
		const total = this.#total_size;
		const logger = this.#logger.child({ start, end, total });
		logger.debug('Requesting byte range');

		const true_end = end - 1; // the given `end` value is exclusive
		const options = {
			method: 'GET',
			headers: { range: `bytes=${start}-${true_end}` }
		};

		let req;
		const res = await new Promise((resolve, reject) => {
			req = https.request(this.#url, options, resolve);
			logger.debug({ req }, 'Sending request...');
			req.once('error', reject).end();
		});

		logger.debug({ req, res }, 'Got response, validating metadata...');
		const validator = new ResponseValidator(res);
		validator.expect_status(206);
		validator.expect_content_range('bytes', start, true_end, total);
		validator.expect_content_length(end - start);
		validator.expect_content_type();

		logger.debug({ req, res }, 'Got partial response, yielding stream...');
		yield* res;
	}

	_readStreamForRange(start, end) {
		const iterable = this.request_range(start, end);
		return Readable.from(iterable, { objectMode: false });
	}
}
