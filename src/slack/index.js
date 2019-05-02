import { App } from '@slack/bolt';

const { SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN } = process.env;

const app = new App({
	token: SLACK_BOT_TOKEN,
	signingSecret: SLACK_SIGNING_SECRET
});

app.use(({ context }) => (context.client = app.client));

export const slack_middleware = app.receiver.app;
export const slack_client = app.client;
