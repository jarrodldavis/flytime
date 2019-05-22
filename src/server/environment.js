// helpers
function create_handler(transform) {
	return {
		get(target, property, receiver) {
			const value = Reflect.get(target, property, receiver);
			if (value === undefined) {
				throw new Error(`Environment variable '${property}' is not defined`);
			}

			const transformed = transform(value);
			if (transformed === null) {
				throw new Error(`Environment variable '${property}' is invalid`);
			}

			return transformed;
		}
	};
}

function parse_string(value) {
	const parsed = value.trim();
	if (parsed.trim() === '') {
		return null;
	}

	return parsed;
}

function parse_integer(value) {
	const parsed = parseInt(value, 10);
	if (isNaN(parsed) || parsed.toString() !== value) {
		return null;
	}

	return parsed;
}

/* eslint-disable no-process-env */
const strings = new Proxy(process.env, create_handler(parse_string));
const integers = new Proxy(process.env, create_handler(parse_integer));
/* eslint-enable no-process-env */

// HTTP
const { PORT } = integers;
export { PORT };

// Shutdown
const {
	SHUTDOWN_SERVER_TIMEOUT,
	SHUTDOWN_REDIS_TIMEOUT,
	SHUTDOWN_DATABASE_TIMEOUT
} = integers;
export {
	SHUTDOWN_SERVER_TIMEOUT,
	SHUTDOWN_REDIS_TIMEOUT,
	SHUTDOWN_DATABASE_TIMEOUT
};

// Webhook Payload Signing
const { SLACK_SIGNING_SECRET } = strings;
const { SLACK_SIGNING_RANDOM_KEY_SIZE } = integers;
export { SLACK_SIGNING_SECRET, SLACK_SIGNING_RANDOM_KEY_SIZE };

// OAuth
const {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
} = strings;

const { OAUTH_STATE_SIZE } = integers;

export {
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET,
	OAUTH_STATE_SIZE
};

// Sessions
const { REDIS_URL, SESSION_SECRET, COOKIE_NAME } = strings;
const { MAX_SESSION_ATTEMPTS } = integers;
export { REDIS_URL, SESSION_SECRET, COOKIE_NAME, MAX_SESSION_ATTEMPTS };

// Database
const { DATABASE_URL } = strings;
const { DATABASE_CONNECT_TIMEOUT, DATABASE_STATEMENT_TIMEOUT } = integers;
export { DATABASE_URL, DATABASE_CONNECT_TIMEOUT, DATABASE_STATEMENT_TIMEOUT };
