import http_error from 'http-errors';
import { unexposed_error_message } from '../common';

export function error_handler(error, req, res, next) {
	res.err = http_error(error);

	if (req.accepts_json) {
		const { status, message, expose } = res.err;
		res.send(status, {
			error: expose ? message : unexposed_error_message
		});
	} else if (req.accepts_html) {
		if (res.err.status === 404) {
			// getting a 404 error here means Polka ran out of handlers
			// something really bad happened in Sapper's middleware
			throw res.err;
		}

		// fallback to Sapper error page
		return next();
	} else {
		// something really bad happened during content negotiation
		throw error;
	}
}
