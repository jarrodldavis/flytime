import { verify } from './_helpers';

export async function post(req, res) {
	if (req.body.ssl_check) {
		return res.send(204);
	}

	await verify(req);

	res.send(200, { text: 'TODO' });
}
