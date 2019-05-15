import { promisify } from 'util';
import { App } from '@slack/bolt';
import { redis_client } from '../server/external-services';

import { SLACK_SIGNING_SECRET } from '../server/environment';

const redis_get = promisify(redis_client.get).bind(redis_client);

async function authorize({ teamId }) {
	const bot_value = await redis_get(`bot:${teamId}`);

	if (!bot_value) {
		throw new Error(`No bot credentials for team '${teamId}'`);
	}

	const { token, id, user } = JSON.parse(bot_value);
	return { botToken: token, botId: id, botUserId: user };
}

const app = new App({ authorize, signingSecret: SLACK_SIGNING_SECRET });

app.use(({ context }) => (context.client = app.client));

export const slack_middleware = app.receiver.app;
export const slack_client = app.client;
