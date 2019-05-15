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
		return res.send(error.status || STATUS_APPLICATION_ERROR, {
			error: error.code
		});
	}

	if (!req.session.user) {
		return res.send(STATUS_AUTHORIZATION_ERROR, { error: NOT_SIGNED_IN });
	}

	try {
		await req.session.destroy();
	} catch (error) {
		return res.send(STATUS_APPLICATION_ERROR, {
			error: SESSION_DESTROY_FAILURE
		});
	}

	res.send(STATUS_SUCCESS_NO_CONTENT);
}
