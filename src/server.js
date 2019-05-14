/* eslint-disable no-console */
import { promisify } from 'util';
import express from 'express';
import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { slack_middleware, slack_client } from './slack';
import { session_middleware, get_client_session_data } from './session';
import { redis_client } from './redis';
import { is_development } from './common';
import { PORT } from './environment';

console.log('Starting up...');

function provide_slack_client(req, _res, next) {
	req.slack_client = slack_client;
	next();
}

const server = express()
	.set('trust proxy', true)
	.use(
		slack_middleware,
		compression({ threshold: 0 }),
		sirv('static', { dev: is_development }),
		provide_slack_client,
		session_middleware,
		sapper.middleware({ session: get_client_session_data })
	)
	.listen(PORT, error => {
		if (error) {
			console.error('Error starting HTTP server:', error);
		} else {
			console.log(`HTTP server started and listening on port ${PORT}`);
		}
	});

const close_server = promisify(server.close).bind(server);
const quit_redis = promisify(redis_client.quit).bind(redis_client);

let shutting_down = false;

async function graceful_shutdown(signal) {
	console.log(`Received ${signal}`);

	if (shutting_down) {
		console.log('Already shutting down, ignoring signal');
		return;
	}

	shutting_down = true;

	console.log('Closing HTTP server...');
	try {
		await close_server();
		console.log('Successfully closed HTTP server');
	} catch (error) {
		console.error('Failed to close HTTP server:', error);
	}

	console.log('Quitting Redis connection...');
	try {
		await quit_redis();
		console.log('Successfully quit Redis connection');
	} catch (error) {
		console.error('Failed to quit Redis connection:', error);
	}

	console.log('Completed shutdown successfully');
}

process.on('SIGTERM', graceful_shutdown);
process.on('SIGINT', graceful_shutdown);
