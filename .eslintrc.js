module.exports = {
	'root': true,
	'env': {
		'es6': true,
	},
	'extends': ['eslint:recommended', 'problems/node10'],
	'globals': {
		'process': 'readonly',
	},
	'parserOptions': {
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	},
	'overrides': [
		{
			'files': ['rollup.config.js'],
			'env': {
				'node': true
			}
		}
	]
};