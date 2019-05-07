import express from 'express';
import { session_middleware } from './session';
import { oauth_start, oauth_callback } from './authentication';
import { validate_oauth_scopes } from './authorization';
import {
	IDENTITY_PATH,
	IDENTITY_SCOPES,
	INSTALL_PATH,
	INSTALL_SCOPES,
	CALLBACK_PATH
} from './constants';

const app = express();
app.use(session_middleware);
app.get(IDENTITY_PATH, oauth_start(IDENTITY_SCOPES));
app.get(INSTALL_PATH, oauth_start(INSTALL_SCOPES));
app.get(CALLBACK_PATH, oauth_callback);
app.use(validate_oauth_scopes);

export const auth_middleware = app;
export { get_client_session_data } from './session';
