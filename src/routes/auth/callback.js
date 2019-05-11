import { AuthenticationError } from '../../common';

const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = process.env;

export async function get(req, res, next) {
	if (res.locals.error) {
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
			redirect_uri: `${req.protocol}://${req.host}${req.path}`
		});
	} catch (error) {
		res.locals.error = error;
		// fallback to Sapper error page
		return next();
	}

	const { access_token, scope, user_id } = result;

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

	if (!user_id) {
		res.locals.error = new AuthenticationError('oauth_missing_user_id');
		// fallback to Sapper error page
		return next();
	}

	try {
		const [{ user }, { team }] = await Promise.all([
			req.slack_client.users.info({ token: access_token, user: user_id }),
			req.slack_client.team.info({ token: access_token })
		]);
		req.session.user = user;
		req.session.team = team;
	} catch (error) {
		res.locals.error = new AuthenticationError(error.code);
		res.locals.error.stack = error.stack;
		return next();
	}

	res.redirect('/');
}
