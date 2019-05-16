import { IncomingMessage } from 'http';

export class Request extends IncomingMessage {
	#id = undefined;

	get id() {
		return this.#id || this.headers['x-request-id'];
	}

	set id(value) {
		this.#id = value;
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
