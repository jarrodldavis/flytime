import uid from 'uid-safe';
import { OAUTH_STATE_GENERATION_FAILURE, ApplicationError } from '../../common';

import {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	OAUTH_STATE_SIZE
} from '../../environment';

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
		error.code = OAUTH_STATE_GENERATION_FAILURE;
		res.locals.error = new ApplicationError(error);
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
