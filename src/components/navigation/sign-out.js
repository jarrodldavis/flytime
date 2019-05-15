import { HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON } from '../../common';

/* eslint-env browser */

export async function sign_out() {
	if ('caches' in window) {
		const keys = await caches.keys();
		await Promise.all(
			keys.filter(key => key.startsWith('offline')).map(caches.delete, caches)
		);
	}

	const response = await fetch('/auth/sign-out', {
		method: 'POST',
		body: '{}',
		headers: { [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON }
	});

	if (response.ok) {
		return;
	}

	const body = await response.json();
	if (body.error === 'not_signed_in') {
		return;
	}

	throw new Error(`Failed to sign out: ${body.error}`);
}
