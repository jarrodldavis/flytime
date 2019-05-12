import {
	SESSION_DESTROY_FAILURE,
	NOT_SIGNED_IN,
	STATUS_APPLICATION_ERROR,
	STATUS_AUTHORIZATION_ERROR,
	STATUS_SUCCESS_NO_CONTENT
} from '../../common';

export async function post(req, res) {
	if (res.locals.error) {
		const error = res.locals.error;
		return res
			.status(error.status || STATUS_APPLICATION_ERROR)
			.json({ error: error.code });
	}

	if (!req.session.user) {
		return res
			.status(STATUS_AUTHORIZATION_ERROR)
			.json({ error: NOT_SIGNED_IN });
	}

	try {
		await req.session.destroy();
	} catch (error) {
		return res
			.status(STATUS_APPLICATION_ERROR)
			.json({ error: SESSION_DESTROY_FAILURE });
	}

	res.status(STATUS_SUCCESS_NO_CONTENT).end();
}
