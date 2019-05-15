import { verify } from './_helpers';
import { STATUS_APPLICATION_ERROR } from '../../common';

export async function post(req, res) {
	if (res.locals.error) {
		const error = res.locals.error;
		return res
			.status(error.status || STATUS_APPLICATION_ERROR)
			.json({ error: error.code });
	}

	if (req.body.ssl_check) {
		return res.status(204).end();
	}

	try {
		await verify(req);
	} catch (error) {
		return res
			.status(error.status || STATUS_APPLICATION_ERROR)
			.json({ error: error.code });
	}

	res.status(200).json({ text: 'TODO' });
}
