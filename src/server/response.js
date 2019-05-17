import { ServerResponse } from 'http';
import send from '@polka/send';
import redirect from '@polka/redirect';

export class Response extends ServerResponse {
	locals = Object.create(null); // eslint-disable-line no-undef

	send(code = 200, data = '', headers = {}) {
		send(this, code, data, headers);
	}

	redirect(location, code = 302) {
		redirect(this, code, location);
	}
}
