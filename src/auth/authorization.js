import { AuthorizationError } from './errors';
import { IDENTITY_SCOPES, INSTALL_SCOPES } from './constants';

export function validate_oauth_scopes(req, res, next) {
	if (!req.session.user) {
		// no scopes to validate because the session isn't authenticated
		return next();
	}

	const user_scopes = new Set(req.session.scopes);
	const signed_in = IDENTITY_SCOPES.every(user_scopes.has, user_scopes);
	const app_installed = INSTALL_SCOPES.every(user_scopes.has, user_scopes);

	if (!signed_in) {
		// token is missing identity.* scopes
		// user needs to Sign in with Slack
		// this can occur if Add to Slack is used first
		res.locals.error = new AuthorizationError('sign_in_required');
	} else if (!app_installed) {
		// token is missing app installation scopes
		// app needs to be installed in workspace (Add to Slack)
		// this occurs when Sign in with Slack is used before installation
		res.locals.error = new AuthorizationError('install_required');
	}

	return next();
}
