import { IDENTITY_SCOPES } from '../../common';
import { oauth_start } from './_helpers';

export const get = oauth_start(IDENTITY_SCOPES);
