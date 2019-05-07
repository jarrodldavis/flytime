import express from 'express';
import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { slack_middleware, slack_client } from './slack';
import { auth_middleware, get_client_session_data } from './auth';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

function provide_slack_client(req, _res, next) {
	req.slack_client = slack_client;
	next();
}

express()
	.use(
		slack_middleware,
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		provide_slack_client,
		auth_middleware,
		sapper.middleware({ session: get_client_session_data })
	)
	.listen(PORT);
