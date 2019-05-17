import accepts from 'accepts';

export function negotiate_content(req, res, next) {
	const accept = accepts(req);

	switch (accept.type(['json', 'html'])) {
		case 'json':
			req.accepts_json = true;
			return next();
		case 'html':
			req.accepts_html = true;
			return next();
		default:
			res.send(406, 'Only JSON or HTML responses are supported');
	}
}
