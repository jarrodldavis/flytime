const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = process.env;

import { AuthenticationError } from '../../common';
import { get_redirect_uri } from './_helpers';

export async function get(req, res, next) {
	if (res.locals.error) {
		// fallback to Sapper error page
		return next();
	}

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
		// fallback to Sapper error page
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
		// fallback to Sapper error page
		return next();
	}

	const { access_token, scope } = result;

	if (!access_token) {
		res.locals.error = new AuthenticationError('oauth_missing_access_token');
		// fallback to Sapper error page
		return next();
	}

	if (!scope) {
		res.locals.error = new AuthenticationError('oauth_missing_scope');
		// fallback to Sapper error page
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

	res.redirect('/');
}
