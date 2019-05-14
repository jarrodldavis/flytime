function get(target, prop, receiver) {
	const value = Reflect.get(target, prop, receiver);

	if (value === undefined || value === '') {
		throw new Error(`Environment variable '${prop}' is not defined`);
	}

	return value;
}

// eslint-disable-next-line no-process-env
const environment = new Proxy(process.env, { get });

// HTTP
const { PORT } = environment;

export { PORT };

// OAuth
const {
	SLACK_SIGNING_SECRET,
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
} = environment;

export {
	SLACK_SIGNING_SECRET,
	SLACK_AUTHORIZATION_URL,
	SLACK_CLIENT_ID,
	SLACK_CLIENT_SECRET
};

export const OAUTH_STATE_SIZE = parseInt(environment.OAUTH_STATE_SIZE, 10);

// Sessions
const {
	REDIS_URL,
	SESSION_SECRET,
	MAX_SESSION_ATTEMPTS,
	COOKIE_NAME
} = environment;

export { REDIS_URL, SESSION_SECRET, MAX_SESSION_ATTEMPTS, COOKIE_NAME };
