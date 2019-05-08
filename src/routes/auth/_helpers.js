import uid from 'uid-safe';
import { AuthorizationError } from '../../common';

const { SLACK_AUTHORIZATION_URL, SLACK_CLIENT_ID } = process.env;
const OAUTH_STATE_SIZE = parseInt(process.env.OAUTH_STATE_SIZE, 10);

export function get_redirect_uri(req) {
	return new URL(`${req.protocol}://${req.host}/auth/callback`).toString();
}

export function oauth_start(scopes) {
	const scope = scopes.join(',');

	return async function(req, res, next) {
		// ignore scope validation since the user is going through OAuth flow again
		if (res.locals.error && !(res.locals.error instanceof AuthorizationError)) {
			// fallback to Sapper error page
			return next();
		}

		let state;
		try {
			state = await uid(OAUTH_STATE_SIZE);
		} catch (error) {
			res.locals.error = error;
			// fallback to Sapper error page
			return next();
		}

		req.session.state = state;

		const authorization_url = new URL(SLACK_AUTHORIZATION_URL);
		authorization_url.searchParams.set('client_id', SLACK_CLIENT_ID);
		authorization_url.searchParams.set('scope', scope);
		authorization_url.searchParams.set('state', state);
		authorization_url.searchParams.set('redirect_uri', get_redirect_uri(req));

		res.redirect(authorization_url.toString());
	};
}
