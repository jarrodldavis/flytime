// application errors
export const SESSION_RETRIEVAL_FAILURE = 'session_retrieval_failure';
export const SESSION_DESTROY_FAILURE = 'session_destroy_failure';
export const OAUTH_STATE_GENERATION_FAILURE = 'oauth_state_generation_failure';
export const OAUTH_MISSING_ACCESS_TOKEN = 'oauth_missing_access_token';
export const OAUTH_MISSING_SCOPE = 'oauth_missing_scope';
export const OAUTH_MISSING_USER_ID = 'oauth_missing_user_id';
export const OAUTH_BOT_TOKEN_SAVE_FAILURE = 'oauth_bot_token_save_failure';

// authentication errors
export const OAUTH_MISSING_SLACK_STATE = 'oauth_missing_slack_state';
export const OAUTH_MISSING_SESSION_STATE = 'oauth_missing_session_state';
export const OAUTH_STATE_MISMATCH = 'oauth_state_mismatch';
export const OAUTH_ACCESS_DENIED = 'oauth_access_denied';
export const OAUTH_MISSING_CODE = 'oauth_missing_code';

// authorization errors
export const NOT_SIGNED_IN = 'not_signed_in';

// HTTP status codes
export const STATUS_APPLICATION_ERROR = 500;
export const STATUS_AUTHORIZATION_ERROR = 403;
export const STATUS_AUTHENTICATION_ERROR = 401;
export const STATUS_SUCCESS_NO_CONTENT = 204;
export const STATUS_SUCCESS_WITH_CONTENT = 200;

class CodedError extends Error {
	constructor(code, message, status) {
		super(message);

		if (code instanceof Error) {
			this.code = code.code;
			this.stack = code.stack;
		} else {
			this.code = code;
		}

		this.status = status;
	}
}

export class ApplicationError extends CodedError {
	constructor(code, message = 'Application Error') {
		super(code, message, STATUS_APPLICATION_ERROR);
	}
}

export class AuthenticationError extends ApplicationError {
	constructor(code, message = 'Authentication Failed') {
		super(code, message, STATUS_AUTHENTICATION_ERROR);
	}
}
