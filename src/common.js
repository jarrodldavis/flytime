// environment
/* globals process:readonly */
/* eslint-disable no-process-env, no-restricted-syntax */
// these values are statically (string-based) replaced by Rollup
export const is_production = process.env.NODE_ENV === 'production';
export const is_development = process.env.NODE_ENV === 'development';
export const is_browser = process.browser;
/* eslint-enable no-process-env, no-restricted-syntax */

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

// request errors
export const CONTENT_TYPE_INVALID = 'content_type_invalid';
export const CONTENT_TYPE_UNSUPPORTED = 'content_type_unsupported';
export const REQUEST_BODY_PARSE_ERROR = 'request_body_parse_error';
export const SLACK_TIMESTAMP_MISSING = 'slack_timestamp_missing';
export const SLACK_TIMESTAMP_INVALID = 'slack_timestamp_invalid';
export const SLACK_TIMESTAMP_TOO_OLD = 'slack_timestamp_too_old';
export const SLACK_SIGNATURE_MISSING = 'slack_signature_missing';
export const SLACK_SIGNATURE_MISMATCH = 'slack_signature_mismatch';

// HTTP headers
export const HEADER_CONTENT_LENGTH = 'content-length';
export const HEADER_SLACK_TIMESTAMP = 'x-slack-request-timestamp';
export const HEADER_SLACK_SIGNATURE = 'x-slack-signature';

// Content-Type header values
export const CONTENT_TYPE_JSON = 'application/json';
export const CONTENT_TYPE_URLENCODED = 'application/x-www-form-urlencoded';

// HTTP status codes
export const STATUS_APPLICATION_ERROR = 500;
export const STATUS_AUTHORIZATION_ERROR = 403;
export const STATUS_AUTHENTICATION_ERROR = 401;
export const STATUS_REQUEST_ERROR = 400;
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

export class AuthenticationError extends CodedError {
	constructor(code, message = 'Authentication Failed') {
		super(code, message, STATUS_AUTHENTICATION_ERROR);
	}
}

export class RequestError extends CodedError {
	constructor(code, message = 'Request Failed') {
		super(code, message, STATUS_REQUEST_ERROR);
	}
}
