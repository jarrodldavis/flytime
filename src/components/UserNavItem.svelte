<script>
	import { stores } from '@sapper/app';
	import SignInButton from './slack-buttons/SignInWithSlackButton';

	const { session } = stores();
	$: ({ user, team } = $session);
</script>

<style>
	p {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	img {
		margin-right: 0.5em;
	}

	.spacer {
		border: 0.5px solid grey;
		height: 1.5em;
		margin: 0 0.5em;
	}
</style>

{#if user === undefined}
	<SignInButton />
{:else if user.name}
	<p>
		<img
			src={user.image_24}
			srcset="{user.image_24} 1x, {user.image_48} 2x"
			alt="Slack avatar for user '{user.name}'"
			title="Slack avatar for user '{user.name}'"
			height="24"
			width="24" />
		<span>Hello, {user.name}</span>
		<span class="spacer" />
		<img
			src={team.image_34}
			srcset="{team.image_34} 1x, {team.image_68} 2x"
			alt="Slack avatar for workspace '{team.name}'"
			title="Slack avatar for workspace '{team.name}'"
			height="24"
			width="24" />
		<a
			href="https://{team.domain}.slack.com/"
			title="Go back to your Slack workspace">
			{team.name}
		</a>
	</p>
{:else if team && team.name}
	<!-- Current session only has Add to Slack info -->
	<p>Hello, {team.name} team member</p>
{:else}
	<!-- Something went really wrong... -->
	<SignInButton />
{/if}
