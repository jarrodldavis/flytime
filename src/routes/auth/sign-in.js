import uid from 'uid-safe';

import {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	OAUTH_STATE_SIZE
} from '../../server/environment';
import { sapper_fallback } from './_helpers';

const SLACK_SCOPES = [
	'bot',
	'commands',
	'team:read',
	'users:read',
	'users.profile:read',
	'users.profile:write'
].join(',');

export const get = sapper_fallback(async function get(req, res) {
	const state = await uid(OAUTH_STATE_SIZE);
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
});
