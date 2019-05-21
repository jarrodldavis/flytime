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
		'no-restricted-syntax': [
			'error',
			{
				selector:
					'MemberExpression[object.name="process"][property.name="browser"]',
				message: 'Unexpected use of process.browser.'
			},
			{
				selector:
					'MemberExpression[object.name="process"][property.name="package"]',
				message: 'Unexpected use of process.package.'
			}
		]
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
			files: ['**/*.svelte'],
			rules: {
				'no-labels': 'off'
			}
		}
	]
};
