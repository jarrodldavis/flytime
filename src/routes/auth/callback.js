import { promisify } from 'util';

import {
	ApplicationError,
	AuthenticationError,
	OAUTH_MISSING_SLACK_STATE,
	OAUTH_MISSING_SESSION_STATE,
	OAUTH_STATE_MISMATCH,
	OAUTH_MISSING_CODE,
	OAUTH_BOT_TOKEN_SAVE_FAILURE,
	OAUTH_MISSING_ACCESS_TOKEN,
	OAUTH_MISSING_SCOPE,
	OAUTH_MISSING_USER_ID
} from '../../common';

import { redis_client } from '../../redis';

const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = process.env;

const redis_set = promisify(redis_client.set).bind(redis_client);

export async function get(req, res, next) {
	if (res.locals.error) {
		// fallback to Sapper error page
		return next();
	}

	delete res.locals.error;

	if (!req.query.state) {
		res.locals.error = new AuthenticationError(OAUTH_MISSING_SLACK_STATE);
	} else if (!req.session.state) {
		res.locals.error = new AuthenticationError(OAUTH_MISSING_SESSION_STATE);
	} else if (req.query.state !== req.session.state) {
		res.locals.error = new AuthenticationError(OAUTH_STATE_MISMATCH);
	} else if (req.query.error) {
		res.locals.error = new AuthenticationError(`oauth_${req.query.error}`);
	} else if (!req.query.code) {
		res.locals.error = new AuthenticationError(OAUTH_MISSING_CODE);
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
		res.locals.error = new ApplicationError(error);
		// fallback to Sapper error page
		return next();
	}

	const { access_token, scope, user_id, team_id } = result;
	try {
		const { bot_user_id, bot_access_token } = result.bot;
		const bot = { token: bot_access_token, user: bot_user_id };

		const bot_user = await req.slack_client.users.info(bot);
		bot.id = bot_user.user.profile.bot_id;

		await redis_set(`bot:${team_id}`, JSON.stringify(bot));
	} catch (error) {
		error.code = error.code || OAUTH_BOT_TOKEN_SAVE_FAILURE;
		res.locals.error = new ApplicationError(error);
		// fallback to Sapper error page
		return next();
	}

	if (access_token) {
		req.session.token = access_token;
	} else {
		res.locals.error = new ApplicationError(OAUTH_MISSING_ACCESS_TOKEN);
		// fallback to Sapper error page
		return next();
	}

	if (scope) {
		req.session.scopes = scope.split(',');
	} else {
		res.locals.error = new ApplicationError(OAUTH_MISSING_SCOPE);
		// fallback to Sapper error page
		return next();
	}

	if (!user_id) {
		res.locals.error = new ApplicationError(OAUTH_MISSING_USER_ID);
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
		res.locals.error = new ApplicationError(error);
		return next();
	}

	res.redirect('/');
}
