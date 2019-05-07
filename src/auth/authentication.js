import uid from 'uid-safe';

import { AuthenticationError } from './errors';
import { CALLBACK_PATH } from './constants';

const {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
} = process.env;

const OAUTH_STATE_SIZE = parseInt(process.env.OAUTH_STATE_SIZE, 10);

function get_redirect_uri(req) {
	return new URL(`${req.protocol}://${req.host}${CALLBACK_PATH}`).toString();
}

export function oauth_start(scopes) {
	const scope = scopes.join(',');

	return async function(req, res, next) {
		// delete error from previous authentication attempt
		delete res.locals.error;

		let state;
		try {
			state = await uid(OAUTH_STATE_SIZE);
		} catch (error) {
			return next(error);
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

export async function oauth_callback(req, res, next) {
	if (!req.query.state) {
		res.locals.error = new AuthenticationError('oauth_missing_slack_state');
	} else if (!req.session.state) {
		res.locals.error = new AuthenticationError('oauth_missing_session_state');
	} else if (req.query.state !== req.session.state) {
		res.locals.error = new AuthenticationError('oauth_state_mismatch');
	} else if (req.query.error) {
		res.locals.error = new AuthenticationError(`oauth_${req.query.error}`);
	} else if (!req.query.code) {
		res.locals.error = new AuthenticationError('oauth_missing_code');
	}

	delete req.session.state;

	if (res.locals.error) {
		return next();
	}

	let result = null;
	try {
		result = await req.slack_client.oauth.access({
			client_id: SLACK_CLIENT_ID,
			client_secret: SLACK_CLIENT_SECRET,
			code: req.query.code,
			redirect_uri: get_redirect_uri(req)
		});
	} catch (error) {
		res.locals.error = Object.assign(new AuthenticationError(), error);
		return next();
	}

	const { access_token, scope } = result;

	if (!access_token) {
		res.locals.error = new AuthenticationError('oauth_missing_access_token');
		return next();
	}

	if (!scope) {
		res.locals.error = new AuthenticationError('oauth_missing_scope');
		return next();
	}

	const { user = {}, team = {}, user_id, team_id, team_name } = result;

	// Add to Slack result has limited user/team info
	// TODO: fetch additional user/team info
	user.id = user.id || user_id;
	team.id = team.id || team_id;
	team.name = team.name || team_name;

	req.session.token = access_token;
	req.session.scopes = scope.split(',');
	req.session.user = user;
	req.session.team = team;

	return next();
}
