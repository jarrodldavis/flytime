<script>
	import { stores } from '@sapper/app';
	import SlackButton from '../components/SlackButton';
	import { is_development, unexposed_error_message } from '../common';

	export let status;
	export let error;

	const OAUTH_ACCESS_DENIED = 'OAuth Error: access_denied';

	function get_title(status) {
		switch (status) {
			case 401:
				return 'Authorization Error';
			case 403:
				return 'Authorization Error';
			case 404:
				return 'Page Not Found';
			default:
				return 'Application Error';
		}
	}

	const { page } = stores();

	$: is_auth_callback = $page.path === '/auth/callback';
	$: title = get_title(status);
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
	<title>{title}</title>
</svelte:head>

<h1>{title}</h1>

{#if message === OAUTH_ACCESS_DENIED}
	<p>
		To use Flytime, access must be provided to your Slack profile and workspace.
	</p>
	<p>Please try signing in again.</p>
	<SlackButton />
{:else if is_auth_callback}
	<p>There was a problem connecting Flytime with Slack.</p>
	<p>Please try signing in again.</p>
	<SlackButton />
{:else if status === 404}
	<p>
		The page
		<code>{$page.path}</code>
		can't be found.
	</p>
{:else}
	<p>An unexpected problem occurred. Please try refreshing the page.</p>
{/if}

<p>
	<small>
		<details>
			<summary>Error Details</summary>
			<span>HTTP {status}.</span>
			{#if is_development && error.stack}
				<pre>{error.stack}</pre>
			{:else if message && message !== unexposed_error_message}
				<code>{message}</code>
			{/if}
		</details>
	</small>
</p>
