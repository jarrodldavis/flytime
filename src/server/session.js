import session, { Session } from 'express-session';
import redis_store from 'connect-redis';
import { promisify } from 'util';

import {
	is_production,
	ApplicationError,
	SESSION_RETRIEVAL_FAILURE
} from '../common';
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
	let attempts_left = MAX_SESSION_ATTEMPTS;

	function try_get_session(error) {
		if (error) {
			error.code = error.code || SESSION_RETRIEVAL_FAILURE;
			res.locals.error = new ApplicationError(error);
			return next();
		}

		attempts_left -= 1;

		if (req.session !== undefined) {
			return next();
		}

		if (attempts_left === 0) {
			req.session = null;
			res.locals.error = new ApplicationError(SESSION_RETRIEVAL_FAILURE);
			return next();
		}

		base_session_middleware(req, res, try_get_session);
	}

	try_get_session();
}

export function get_client_session_data(req, res) {
	const { user, team } = req.session || {};

	let { error } = res.locals;
	if (error) {
		// clone error into plain object and filter unneeded properties
		const { message, code, status } = error;
		error = { message, code, status };
	}

	return { error, user, team };
}
