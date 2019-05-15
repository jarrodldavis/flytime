/* eslint-env node */
import crypto from 'crypto';
import { DateTime } from 'luxon';
import {
	SLACK_SIGNING_SECRET,
	SLACK_SIGNING_RANDOM_KEY_SIZE
} from '../../server/environment';
import {
	RequestError,
	HEADER_SLACK_TIMESTAMP,
	HEADER_SLACK_SIGNATURE,
	SLACK_TIMESTAMP_MISSING,
	SLACK_TIMESTAMP_INVALID,
	SLACK_TIMESTAMP_TOO_OLD,
	SLACK_SIGNATURE_MISSING,
	SLACK_SIGNATURE_MISMATCH
} from '../../common';

function get_timestamp(req) {
	const timestamp = req.headers[HEADER_SLACK_TIMESTAMP];
	if (!timestamp) {
		throw new RequestError(SLACK_TIMESTAMP_MISSING);
	}

	if (!/^\d+$/.test(timestamp)) {
		throw new RequestError(SLACK_TIMESTAMP_INVALID);
	}

	const parsed_timestamp = DateTime.fromSeconds(parseInt(timestamp, 10), {
		zone: 'utc'
	});

	if (!parsed_timestamp.isValid) {
		throw new RequestError(SLACK_TIMESTAMP_INVALID);
	}

	const minute_difference = parsed_timestamp
		.diffNow('minutes')
		.negate()
		.as('minutes');

	if (minute_difference < 0 || minute_difference > 5) {
		throw new RequestError(SLACK_TIMESTAMP_TOO_OLD);
	}

	return timestamp;
}

function get_signature(req) {
	const provided_signature = req.headers[HEADER_SLACK_SIGNATURE];
	if (!provided_signature) {
		throw new RequestError(SLACK_SIGNATURE_MISSING);
	}

	const [version] = provided_signature.split('=');
	return { provided_signature, version };
}

export async function verify(req) {
	const timestamp = get_timestamp(req);
	const { provided_signature, version } = get_signature(req);

	const computed_digest = crypto
		.createHmac('sha256', SLACK_SIGNING_SECRET)
		.update(`${version}:${timestamp}:${req.raw_body}`, req.encoding)
		.digest('hex');

	const random_key = crypto.randomBytes(SLACK_SIGNING_RANDOM_KEY_SIZE);
	const computed_buffer = crypto
		.createHmac('sha256', random_key)
		.update(`${version}=${computed_digest}`)
		.digest();
	const provided_buffer = crypto
		.createHmac('sha256', random_key)
		.update(provided_signature)
		.digest();

	if (!crypto.timingSafeEqual(computed_buffer, provided_buffer)) {
		throw new RequestError(SLACK_SIGNATURE_MISMATCH);
	}
}
