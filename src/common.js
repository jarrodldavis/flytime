export const IDENTITY_SCOPES = [
	'identity.basic',
	'identity.avatar',
	'identity.team'
];

export const INSTALL_SCOPES = [
	'bot',
	'commands',
	'users:read',
	'users.profile:read',
	'users.profile:write'
];

export class ApplicationError extends Error {
	constructor(code, message = 'Application Error', status = 500) {
		super(message);

		Object.defineProperties(this, {
			message: { enumerable: true }
		});

		this.code = code;
		this.status = status;
	}
}

export class AuthenticationError extends ApplicationError {
	constructor(code, message = 'Authentication Failed') {
		super(code, message, 401);
	}
}

export class AuthorizationError extends ApplicationError {
	constructor(code, message = 'Authorization Failed') {
		super(code, message, 403);
	}
}
