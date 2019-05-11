import session, { Session } from 'express-session';
import redis_store from 'connect-redis';
import { promisify } from 'util';

import { ApplicationError } from './common';

Session.prototype.regenerate = promisify(Session.prototype.regenerate);
Session.prototype.destroy = promisify(Session.prototype.destroy);
Session.prototype.reload = promisify(Session.prototype.reload);
Session.prototype.save = promisify(Session.prototype.save);

const {
	REDIS_URL,
	SESSION_SECRET,
	MAX_SESSION_ATTEMPTS,
	COOKIE_NAME,
	NODE_ENV
} = process.env;

const RedisStore = redis_store(session);

const base_session_middleware = session({
	store: new RedisStore({ url: REDIS_URL, unref: true }),
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: NODE_ENV === 'production'
	},
	name: COOKIE_NAME,
	proxy: NODE_ENV === 'production'
});

export function session_middleware(req, res, next) {
	let attempts_left = MAX_SESSION_ATTEMPTS;

	function try_get_session(error) {
		if (error) {
			res.locals.error = error;
			return next();
		}

		attempts_left -= 1;

		if (req.session !== undefined) {
			return next();
		}

		if (attempts_left === 0) {
			req.session = null;
			res.locals.error = new ApplicationError('session_retrieval_failure');
			return next();
		}

		base_session_middleware(req, res, try_get_session);
	}

	try_get_session();
}

export function get_client_session_data(req, res) {
	const { user, team } = req.session || {};
	const { error } = res.locals;
	// clone error into plain object
	return { error: error && { ...error }, user, team };
}
