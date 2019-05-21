import { create_proxy_handler, parse_string, parse_integer } from './helpers';

/* eslint-disable no-process-env */
const strings = new Proxy(process.env, create_proxy_handler(parse_string));
const integers = new Proxy(process.env, create_proxy_handler(parse_integer));
/* eslint-enable no-process-env */

// HTTP
const { PORT } = integers;
export { PORT };

// Shutdown
const { SHUTDOWN_SERVER_TIMEOUT, SHUTDOWN_REDIS_TIMEOUT } = integers;
export { SHUTDOWN_SERVER_TIMEOUT, SHUTDOWN_REDIS_TIMEOUT };

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
