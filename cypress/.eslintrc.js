module.exports = {
	root: false,
	plugins: ['cypress', 'mocha'],
	env: {
		node: true,
		mocha: true,
		'cypress/globals': true
	},
	extends: ['plugin:cypress/recommended'],
	rules: {
		'func-names': 'off',
		'mocha/no-exclusive-tests': 'error',
		'mocha/no-pending-tests': 'error',
		'mocha/no-skipped-tests': 'error',
		'mocha/no-global-tests': 'error',
		'mocha/no-synchronous-tests': 'off',
		'mocha/no-return-and-callback': 'error',
		'mocha/handle-done-callback': 'error',
		'mocha/no-hooks': 'off',
		'mocha/no-hooks-for-single-case': 'warn',
		'mocha/no-sibling-hooks': 'error',
		'mocha/no-top-level-hooks': 'off',
		'mocha/no-nested-tests': 'error',
		'mocha/no-setup-in-describe': 'warn',
		'mocha/no-async-describe': 'error',
		'mocha/no-mocha-arrows': 'error',
		'mocha/prefer-arrow-callback': 'off',
		'mocha/no-identical-title': 'warn',
		'mocha/max-top-level-suites': 'error'
	}
};
