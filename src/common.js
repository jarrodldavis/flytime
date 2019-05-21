// environment
/* globals process:readonly */
/* eslint-disable no-process-env, no-restricted-syntax */
// these values are statically (string-based) replaced by Rollup
export const is_production = process.env.NODE_ENV === 'production';
export const is_development = process.env.NODE_ENV === 'development';
export const is_browser = process.browser;
export const name = process.package.name;
export const version = process.package.version;
/* eslint-enable no-process-env, no-restricted-syntax */

export const unexposed_error_message = 'Application Error';

export function timeout(timeout) {
	return new Promise((_, reject) => {
		setTimeout(
			() => reject(new Error(`Timeout reached after ${timeout} milliseconds`)),
			timeout
		).unref();
	});
}
