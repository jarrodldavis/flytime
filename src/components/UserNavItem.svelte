<script>
	import { stores } from '@sapper/app';
	import SlackButton from './SlackButton';
	import UserInfo from './UserInfo';
	import TeamInfo from './TeamInfo';

	const { session } = stores();
	$: ({ user, team } = $session);
</script>

<style>
	p {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0;
		/* same height as Slack button */
		height: 40px;
	}

	.spacer {
		border: 0.5px solid grey;
		height: 1.5em;
		margin: 0 0.5em;
	}
</style>

{#if user && team}
	<p>
		<UserInfo {user} />
		<span class="spacer" />
		<TeamInfo {team} />
	</p>
{:else}
	<SlackButton />
{/if}
