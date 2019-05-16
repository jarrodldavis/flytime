<script>
	import { stores } from '@sapper/app';
	import SlackButton from '../components/SlackButton';
	import { is_development, unexposed_error_message } from '../common';

	export let status;
	export let error;

	const OAUTH_ACCESS_DENIED = 'OAuth Error: access_denied';

	const { page } = stores();

	$: is_auth_callback = $page.path === '/auth/callback';
	$: message = error.message;
</script>

<style>
	h1,
	p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}
</style>

<svelte:head>
	<title>{status} Error</title>
</svelte:head>

<h1>Error</h1>

{#if message === OAUTH_ACCESS_DENIED}
	<p>
		To use Flytime, access must be provided to your Slack profile and workspace.
	</p>
	<p>Please try signing in again.</p>
	<SlackButton />
{:else if is_auth_callback}
	<p>There was a problem authenticating Flytime with Slack.</p>
	<p>Please try signing in again.</p>
	<SlackButton />
{:else}
	<p>An unexpected problem occurred. Please try refreshing the page.</p>
{/if}

<p>
	<small>
		{#if is_development && error.stack}
			Error Details:
			<pre>{error.stack}</pre>
		{:else if message && message !== unexposed_error_message}
			Error Details:
			<code>{message}</code>
		{/if}
	</small>
</p>
