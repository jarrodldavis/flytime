import { IncomingMessage } from 'http';

export class Request extends IncomingMessage {
	get id() {
		return this._id || this.headers['x-request-id'];
	}

	set id(value) {
		this._id = value;
	}

	get host() {
		return this.headers['x-forwarded-host'] || this.headers.host;
	}

	get protocol() {
		let protocol = this.headers['x-forwarded-proto'];

		if (!protocol) {
			protocol = this.connection.encrypted ? 'https' : 'http';
		}

		return protocol;
	}
}
