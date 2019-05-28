import http_error from 'http-errors';
import { unexposed_error_message } from '../common';
import { get_logger } from './logger';

const logger = get_logger('http:error');

export function error_handler(error, req, res, next) {
	const err = http_error(error);

	if (res.err) {
		logger.fatal(
			{ error: res.err, err },
			'Encountered error while handling another error'
		);
		throw res.err;
	}

	res.err = err;

	if (req.accepts_json) {
		const { status, message, expose } = res.err;
		res.send(status, {
			error: expose ? message : unexposed_error_message
		});
	} else if (req.accepts_html) {
		if (res.err.status === 404) {
			// getting a 404 error here means Polka ran out of handlers
			// something really bad happened in Sapper's middleware
			logger.fatal({ error: res.err }, 'Unexpectedly ran out of HTTP handlers');
			throw res.err;
		}

		// fallback to Sapper error page
		return next();
	} else {
		// something really bad happened during content negotiation
		logger.fatal({ error: res.err }, 'Content negotiation failed');
		throw error;
	}
}
