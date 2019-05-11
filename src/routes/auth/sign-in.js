import uid from 'uid-safe';
import { ApplicationError } from '../../common';

const { SLACK_AUTHORIZATION_URL, SLACK_CLIENT_ID } = process.env;
const OAUTH_STATE_SIZE = parseInt(process.env.OAUTH_STATE_SIZE, 10);

const SLACK_SCOPES = [
	'bot',
	'commands',
	'team:read',
	'users:read',
	'users.profile:read',
	'users.profile:write'
].join(',');

export async function get(req, res, next) {
	if (res.locals.error) {
		// fallback to Sapper error page
		return next();
	}

	let state;
	try {
		state = await uid(OAUTH_STATE_SIZE);
	} catch (error) {
		res.locals.error = new ApplicationError('oauth_state_generation_failure');
		res.locals.error.stack = error.stack;
		// fallback to Sapper error page
		return next();
	}

	req.session.state = state;

	const authorization_url = new URL(SLACK_AUTHORIZATION_URL);
	authorization_url.searchParams.set('client_id', SLACK_CLIENT_ID);
	authorization_url.searchParams.set('scope', SLACK_SCOPES);
	authorization_url.searchParams.set('state', state);
	authorization_url.searchParams.set(
		'redirect_uri',
		`${req.protocol}://${req.host}/auth/callback`
	);

	res.redirect(authorization_url.toString());
}
