export async function post(req, res) {
	if (res.locals.error) {
		const error = res.locals.error;
		return res
			.status(error.status || 500)
			.json({ ok: false, error: error.code });
	}

	if (!req.session.user) {
		return res.status(403).json({ ok: false, error: 'not_signed_in' });
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
