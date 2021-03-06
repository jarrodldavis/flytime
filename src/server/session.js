import session, { Session } from 'express-session';
import redis_store from 'connect-redis';
import { promisify } from 'util';
import http_error, { InternalServerError } from 'http-errors';

import { is_production, unexposed_error_message } from '../common';
import {
	SESSION_SECRET,
	MAX_SESSION_ATTEMPTS,
	COOKIE_NAME
} from './environment';
import { redis_client } from './external-services';

Session.prototype.regenerate = promisify(Session.prototype.regenerate);
Session.prototype.destroy = promisify(Session.prototype.destroy);
Session.prototype.reload = promisify(Session.prototype.reload);
Session.prototype.save = promisify(Session.prototype.save);

const RedisStore = redis_store(session);

const base_session_middleware = session({
	store: new RedisStore({ client: redis_client }),
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: is_production
	},
	name: COOKIE_NAME,
	proxy: is_production
});

export function session_middleware(req, res, next) {
	const path = req.path;
	// no need to retrieve session for Sapper-served static assets
	if (path.startsWith('/service-worker') || path.startsWith('/client')) {
		req.session = null;
		return next();
	}

	let attempts_left = MAX_SESSION_ATTEMPTS + 1;

	function try_get_session(error) {
		if (error) {
			return next(error);
		}

		attempts_left -= 1;

		if (req.session !== undefined) {
			return next();
		}

		if (attempts_left === 0) {
			req.session = null;
			return next(
				new InternalServerError(
					`Failed to retrieve session after ${MAX_SESSION_ATTEMPTS} attempts.`
				)
			);
		}

		base_session_middleware(req, res, try_get_session);
	}

	try_get_session();
}

export function get_client_session_data(req, res) {
	const { user, team } = req.session || {};

	let error = res.err;
	if (error) {
		const { status, message, expose } = http_error(error);
		error = { status, message: expose ? message : unexposed_error_message };
	}

	return { error, user, team };
}
