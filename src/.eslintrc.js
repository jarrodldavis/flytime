module.exports = {
	'root': false,
	'plugins': ['svelte3'], // replace with @jarrodldavis/svelte once released
	'env': {
		'shared-node-browser': true
	},
	'overrides': [
		{
			'files': ['client.js'],
			'env': {
				'browser': true
			}
		},
		{
			'files': ['server.js'],
			'env': {
				'node': true
			}
		},
		{
			'files': ['service-worker.js'],
			'env': {
				'serviceworker': true
			}
		}
	]
};
