import { ServerResponse } from 'http';
import send from '@polka/send';
import { STATUS_SUCCESS_WITH_CONTENT, STATUS_REDIRECT } from '../common';

export class Response extends ServerResponse {
	send(code = STATUS_SUCCESS_WITH_CONTENT, data = '', headers = {}) {
		send(this, code, data, headers);
	}

	redirect(location, code = STATUS_REDIRECT) {
		this.send(code, null, { location });
	}

	get locals() {
		if (!this._locals) {
			this._locals = Object.create(null);
		}

		return this._locals;
	}
}
