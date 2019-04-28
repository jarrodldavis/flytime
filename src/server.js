import sirv from 'sirv';
import compression from 'compression';
import { App, ExpressReceiver } from '@slack/bolt';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV, SLACK_SIGNING_SECRET } = process.env;
const dev = NODE_ENV === 'development';

const receiver = new ExpressReceiver({ signingSecret: SLACK_SIGNING_SECRET });
receiver.app.use(
	compression({ threshold: 0 }),
	sirv('static', { dev }),
	sapper.middleware()
);

async function authorize() {
	// TODO
	return Promise.reject(new Error('Authorization is not implemented'));
}

const app = new App({ receiver, authorize });

// eslint-disable-next-line no-console
app.start(PORT).catch(error => console.log('error', error));
