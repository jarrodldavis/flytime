import { verify } from './_helpers';
import {
	STATUS_APPLICATION_ERROR,
	STATUS_SUCCESS_NO_CONTENT,
	STATUS_SUCCESS_WITH_CONTENT
} from '../../common';

export async function post(req, res) {
	if (res.locals.error) {
		const error = res.locals.error;
		return res
			.status(error.status || STATUS_APPLICATION_ERROR)
			.json({ error: error.code });
	}

	if (req.body.ssl_check) {
		return res.send(STATUS_SUCCESS_NO_CONTENT);
	}

	try {
		await verify(req);
	} catch (error) {
		return res
			.status(error.status || STATUS_APPLICATION_ERROR)
			.json({ error: error.code });
	}

	res.send(STATUS_SUCCESS_WITH_CONTENT, { text: 'TODO' });
}
