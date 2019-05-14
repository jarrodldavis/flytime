module.exports = {
	root: false,
	plugins: ['svelte3'], // replace with @jarrodldavis/svelte once released
	env: {
		'shared-node-browser': true
	},
	settings: {
		'svelte3/lint-template': true
	},
	overrides: [
		{
			files: ['client.js'],
			env: {
				browser: true
			}
		},
		{
			files: ['server.js', 'environment.js', 'session.js', 'redis.js'],
			env: {
				node: true
			}
		},
		{
			files: ['service-worker.js'],
			env: {
				serviceworker: true
			}
		},
		{
			files: ['**/*.svelte'],
			rules: {
				'no-labels': 'off'
			}
		}
	]
};
