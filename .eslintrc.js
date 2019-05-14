module.exports = {
	root: true,
	env: {
		es6: true
	},
	extends: ['eslint:recommended', 'problems/node10', 'prettier'],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	rules: {
		'no-process-env': 'error',
		'no-restricted-syntax': [
			'error',
			{
				selector:
					'MemberExpression[object.name="process"][property.name="browser"]',
				message: 'Unexpected use of process.browser.'
			}
		]
	},
	overrides: [
		{
			files: ['rollup.config.js', 'mock-redis.js'],
			env: {
				node: true
			}
		}
	]
};
