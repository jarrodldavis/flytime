import { AuthenticationError, AuthorizationError } from '../../common';
import { get_redirect_uri } from './_helpers';

const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = process.env;

export async function get(req, res, next) {
	// ignore scope validation since the user is going through OAuth flow again
	if (res.locals.error && !(res.locals.error instanceof AuthorizationError)) {
		// fallback to Sapper error page
		return next();
	}

	delete res.locals.error;

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

	if (access_token) {
		req.session.token = access_token;
	} else {
		res.locals.error = new AuthenticationError('oauth_missing_access_token');
		// fallback to Sapper error page
		return next();
	}

	if (scope) {
		req.session.scopes = scope.split(',');
	} else {
		res.locals.error = new AuthenticationError('oauth_missing_scope');
		// fallback to Sapper error page
		return next();
	}

	const { user, team, user_id, team_id, team_name } = result;

	if (user && team) {
		// Sign in with Slack result
		req.session.user = user;
		req.session.team = team;
		return res.redirect('/');
	}

	// Add to Slack result has limited user/team info
	try {
		result = await req.slack_client.users.identity({ token: access_token });
		req.session.user = result.user;
		req.session.team = result.team;
	} catch (error) {
		if (error.data.error === 'missing_scope') {
			// Add to Slack used before Sign in with Slack
			// Put basic info in session and allow `validate_oauth_scopes` to show error page
			req.session.user = { id: user_id };
			req.session.team = { id: team_id, name: team_name };
		} else {
			res.locals.error = Object.assign(new AuthenticationError(), error);
			// fallback to Sapper error page
			return next();
		}
	}

	res.redirect('/');
}
