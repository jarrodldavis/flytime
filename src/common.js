// application errors
export const SESSION_RETRIEVAL_FAILURE = 'session_retrieval_failure';
export const OAUTH_STATE_GENERATION_FAILURE = 'oauth_state_generation_failure';

// authentication errors
export const OAUTH_MISSING_SLACK_STATE = 'oauth_missing_slack_state';
export const OAUTH_MISSING_SESSION_STATE = 'oauth_missing_session_state';
export const OAUTH_STATE_MISMATCH = 'oauth_state_mismatch';
export const OAUTH_ACCESS_DENIED = 'oauth_access_denied';
export const OAUTH_MISSING_CODE = 'oauth_missing_code';
export const OAUTH_MISSING_ACCESS_TOKEN = 'oauth_missing_access_token';
export const OAUTH_MISSING_SCOPE = 'oauth_missing_scope';
export const OAUTH_MISSING_USER_ID = 'oauth_missing_user_id';

export class ApplicationError extends Error {
	constructor(code, message = 'Application Error', status = 500) {
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
