<script>
	import { stores } from '@sapper/app';
	import { sign_out } from './sign-out';

	const { session } = stores();

	let promise = Promise.resolve();
	async function reset_session() {
		promise = sign_out().then(() => ($session = {}));
	}
</script>

{#await promise}
	<button disabled>Signing Out...</button>
{:then}
	{#if $session.user}
		<button on:click={reset_session}>Sign Out</button>
	{:else}
		<button disabled>Signed Out!</button>
	{/if}
{:catch}
	<button disabled>Error Signing Out</button>
{/await}
