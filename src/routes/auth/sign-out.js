import { AuthorizationError } from '../../common';

export async function post(req, res) {
	// ignore scope validation since the user is signing out
	if (res.locals.error && !(res.locals.error instanceof AuthorizationError)) {
		const error = res.locals.error;
		return res
			.status(error.status || 500)
			.json({ ok: false, error: error.code });
	}

	if (!req.session.user) {
		return res.status(403).json({ ok: false, error: 'not_signed_in' });
	}

	try {
		await req.slack_client.auth.revoke({ token: req.session.token });
	} catch (error) {
		if (!error.error === 'token_revoked') {
			return res.status(500).json({ ok: false, error: error.error });
		}
	}

	try {
		await req.session.destroy();
	} catch (error) {
		return res
			.status(500)
			.json({ ok: false, error: 'session_destroy_failure' });
	}

	res.status(200).json({ ok: true });
}
