import querystring from 'querystring';
import get_raw_body from 'raw-body';
import { parse as parse_content_type } from 'content-type';
import {
	RequestError,
	CONTENT_TYPE_INVALID,
	CONTENT_TYPE_UNSUPPORTED,
	REQUEST_BODY_PARSE_ERROR,
	HEADER_CONTENT_LENGTH,
	CONTENT_TYPE_JSON,
	CONTENT_TYPE_URLENCODED
} from '../common';

export async function parse_body(req, res, next) {
	if (req.method !== 'POST') {
		return next();
	}

	let content_type;
	try {
		content_type = parse_content_type(req);
	} catch (error) {
		res.locals.error = new RequestError(CONTENT_TYPE_INVALID);
		return next();
	}

	const encoding = content_type.parameters.charset || 'utf-8';
	const length = req.headers[HEADER_CONTENT_LENGTH];

	try {
		switch (content_type.type) {
			case CONTENT_TYPE_JSON:
				req.raw_body = await get_raw_body(req, { length, encoding });
				req.body = JSON.parse(req.raw_body);
				break;
			case CONTENT_TYPE_URLENCODED:
				req.raw_body = await get_raw_body(req, { length, encoding });
				req.body = querystring.parse(req.raw_body);
				break;
			default:
				throw new RequestError(CONTENT_TYPE_UNSUPPORTED);
		}
	} catch (error) {
		error.code = error.code || REQUEST_BODY_PARSE_ERROR;
		res.locals.error = new RequestError(error);
		return next();
	}

	req.encoding = encoding;
	return next();
}
