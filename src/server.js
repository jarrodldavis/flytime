import express from 'express';
import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { slack_middleware, slack_client } from './slack';
import { session_middleware, get_client_session_data } from './session';
import { is_development } from './common';
import { PORT } from './environment';

function provide_slack_client(req, _res, next) {
	req.slack_client = slack_client;
	next();
}

express()
	.set('trust proxy', true)
	.use(
		slack_middleware,
		compression({ threshold: 0 }),
		sirv('static', { dev: is_development }),
		provide_slack_client,
		session_middleware,
		sapper.middleware({ session: get_client_session_data })
	)
	.listen(PORT);
