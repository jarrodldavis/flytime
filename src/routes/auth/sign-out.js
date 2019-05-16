import { Unauthorized as AuthenticationError } from 'http-errors';

export async function post(req, res) {
	if (!req.session.user) {
		throw new AuthenticationError('Not signed in');
	}

	await req.session.destroy();

	res.send(204);
}
