const restrictions = require('./.eslintrc.restrictions');

module.exports = {
	root: true,
	plugins: ['svelte3'], // replace with @jarrodldavis/svelte once released
	env: {
		'shared-node-browser': true
	},
	extends: ['eslint:recommended', 'problems/node10', 'prettier'],
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: 'module'
	},
	settings: {
		'svelte3/lint-template': true
	},
	rules: {
		'no-process-env': 'error',
		'no-restricted-syntax': restrictions.all()
	},
	overrides: [
		{
			files: [
				'rollup.config.js',
				'mock-redis.js',
				'src/server.js',
				'src/server/*.js'
			],
			env: { node: true }
		},
		{
			files: ['src/client.js'],
			env: { browser: true }
		},
		{
			files: ['src/service-worker.js'],
			env: { serviceworker: true }
		},
		{
			files: ['src/server/external-services.js'],
			rules: {
				'no-restricted-syntax': restrictions.except('pg', 'pool')
			}
		},
		{
			files: ['src/server/queries/**/*.js'],
			rules: {
				'no-restricted-syntax': restrictions.except('pool', 'squid')
			}
		}
	]
};
