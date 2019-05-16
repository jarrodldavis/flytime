import { ServerResponse } from 'http';
import send from '@polka/send';
import redirect from '@polka/redirect';

export class Response extends ServerResponse {
	send(code = 200, data = '', headers = {}) {
		send(this, code, data, headers);
	}

	redirect(location, code = 302) {
		redirect(this, code, location);
	}

	get locals() {
		if (!this._locals) {
			this._locals = Object.create(null);
		}

		return this._locals;
	}
}
