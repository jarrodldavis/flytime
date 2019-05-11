<script>
	import { stores } from '@sapper/app';
	import SlackButton from '../components/SlackButton';
	import { OAUTH_ACCESS_DENIED } from '../common';

	export let status;
	export let error;

	const { session, page } = stores();

	// server-rendered serialization of errors doesn't include custom properties
	function get_code($session) {
		if (!$session.error) {
			return error.code || 'unknown';
		}

		if ($session.error.message !== error.message) {
			return error.code || 'unknown';
		}

		return $session.error.code;
	}

	$: code = get_code($session);
	$: is_auth_callback = $page.path === '/auth/callback';

	const dev = process.env.NODE_ENV === 'development';
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
	<title>{error.message}</title>
</svelte:head>

<h1>{error.message}</h1>

{#if code === OAUTH_ACCESS_DENIED}
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

{#if code}
	<p>
		<small>
			Error Code:
			<code>{code}</code>
		</small>
	</p>
{/if}

{#if dev && error.stack}
	<pre>{error.stack}</pre>
{/if}
