module.exports = {
	root: true,
	env: {
		es6: true
	},
	extends: ['eslint:recommended', 'problems/node10', 'prettier'],
	globals: {
		process: 'readonly'
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
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
