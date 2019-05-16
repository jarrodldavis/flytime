import { promisify } from 'util';
import {
	Unauthorized as AuthenticationError,
	InternalServerError as ApplicationError
} from 'http-errors';

import { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from '../../server/environment';
import { redis_client, slack_client } from '../../server/external-services';
import { sapper_fallback } from './_helpers';

const redis_set = promisify(redis_client.set).bind(redis_client);

export const get = sapper_fallback(async function get(req, res) {
	const session_state = req.session.state;
	delete req.session.state;

	if (!req.query.state) {
		throw new AuthenticationError('Missing Slack-provided OAuth state');
	} else if (!session_state) {
		throw new AuthenticationError('Missing session-provided OAuth state');
	} else if (req.query.state !== session_state) {
		throw new AuthenticationError('OAuth state-mismatch');
	} else if (req.query.error) {
		throw new AuthenticationError(`OAuth Error: ${req.query.error}`);
	} else if (!req.query.code) {
		throw new AuthenticationError('Missing OAuth code');
	}

	const result = await slack_client.oauth.access({
		client_id: SLACK_CLIENT_ID,
		client_secret: SLACK_CLIENT_SECRET,
		code: req.query.code,
		redirect_uri: `${req.protocol}://${req.host}${req.path}`
	});

	const { access_token, scope, user_id, team_id } = result;
	if (!access_token) {
		throw new ApplicationError('Missing access token from OAuth response');
	}
	if (!scope) {
		throw new ApplicationError('Missing scope from OAuth response');
	}
	if (!user_id) {
		throw new ApplicationError('Missing user ID from OAuth response');
	}
	if (!team_id) {
		throw new ApplicationError('Missing team ID from OAuth response');
	}

	const [{ user }, { team }] = await Promise.all([
		slack_client.users.info({ token: access_token, user: user_id }),
		slack_client.team.info({ token: access_token })
	]);

	const { bot_user_id, bot_access_token } = result.bot;
	const bot = { token: bot_access_token, user: bot_user_id };
	const bot_user = await slack_client.users.info(bot);
	bot.id = bot_user.user.profile.bot_id;
	await redis_set(`bot:${team_id}`, JSON.stringify(bot));

	req.session.token = access_token;
	req.session.scopes = scope.split(',');
	req.session.user = user;
	req.session.team = team;

	return res.redirect('/');
});
