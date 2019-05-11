<script>
	export let team;

	$: description = `Slack avatar for workspace '${team.name}'`;
</script>

<style>
	img {
		margin-right: 0.5em;
	}
</style>

<img
	src={team.icon.image_34}
	srcset="{team.icon.image_34} 1x, {team.icon.image_68} 2x"
	alt={description}
	title={description}
	height="24"
	width="24" />
<a
	href="https://{team.domain}.slack.com/"
	title="Go back to your Slack workspace">
	{team.name}
</a>
