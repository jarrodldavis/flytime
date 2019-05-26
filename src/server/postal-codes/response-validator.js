import { strict as assert } from 'assert';

export class ResponseValidator {
	#res;

	constructor(res) {
		this.#res = res;
	}

	expect_status(code) {
		assert.equal(this.#res.statusCode, code, 'Unexpected status code');
	}

	expect_accept_ranges(unit = 'bytes') {
		const raw = this.#res.headers['accept-ranges'];
		assert.ok(raw, 'No Accept-Ranges header is present');
		assert.equal(raw, unit, 'Unexpected Accept-Ranges header');
	}

	parse_content_range(raw) {
		const match = /(\w+) (\d+)-(\d+)\/(\d+)/.exec(raw);
		assert.ok(match, `Malformed Content-Range header: ${raw}`);
		// eslint-disable-next-line no-unused-vars
		const [_entire_match, unit, start, end, total] = match;
		return {
			unit,
			start: Number.parseInt(start, 10),
			end: Number.parseInt(end, 10),
			total: Number.parseInt(total, 10)
		};
	}

	expect_content_range(unit, start, end, total) {
		const raw = this.#res.headers['content-range'];
		assert.ok(raw, 'No Content-Range header is present');

		const actual = this.parse_content_range(raw);
		const expected = { unit, start, end, total };
		assert.deepEqual(actual, expected, 'Unexpected Content-Range header');
	}

	expect_content_length(length = null) {
		const raw = this.#res.headers['content-length'];
		assert.ok(raw, 'No Content-Length header is present');

		const parsed = Number.parseInt(raw, 10);
		assert.ok(parsed, 'Malformed Content-Length header');
		assert.equal(parsed.toString(), raw, 'Malformed Content-Length header');

		if (length !== null) {
			assert.equal(parsed, length, 'Unexpected Content-Length header');
		}

		return parsed;
	}

	expect_content_type(type = 'application/zip') {
		const raw = this.#res.headers['content-type'];
		assert.ok(raw, 'No Content-Type header is present');
		assert.equal(raw, type, 'Unexpected Content-Type header');
		return raw;
	}
}
