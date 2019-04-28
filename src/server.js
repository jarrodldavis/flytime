import sirv from 'sirv';
import compression from 'compression';
import { App, ExpressReceiver } from '@slack/bolt';
import * as sapper from '@sapper/server';

import { add_slack_events } from './slack';

const { PORT, NODE_ENV, SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN } = process.env;
const dev = NODE_ENV === 'development';

const receiver = new ExpressReceiver({ signingSecret: SLACK_SIGNING_SECRET });

// TODO: multi-team authorization
const app = new App({ receiver, token: SLACK_BOT_TOKEN });
add_slack_events(app);

receiver.app.use(
	compression({ threshold: 0 }),
	sirv('static', { dev }),
	req => (req.slack_client = app.client),
	sapper.middleware()
);

// eslint-disable-next-line no-console
app.start(PORT).catch(error => console.log('error', error));
