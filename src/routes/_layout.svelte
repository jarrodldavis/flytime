<script context="module">
	export function preload(page, session) {
		if (page.error) {
			return;
		}

		const error = session.error;
		if (error) {
			this.error(error.status || 500, error.message);
		}
	}
</script>

<script>
	import Nav from '../components/navigation';

	export let segment;
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment} />

<main>
	<slot />
</main>
