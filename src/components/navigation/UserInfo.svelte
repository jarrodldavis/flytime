<script>
	export let user;

	$: profile = user.profile;
	$: display_name = profile.display_name || profile.real_name || user.name;
	$: description = `Slack avatar for user '${display_name}'`;
</script>

<style>
	img {
		margin-right: 0.5em;
	}
</style>

<img
	src={profile.image_24}
	srcset="{profile.image_24} 1x, {profile.image_48} 2x"
	alt={description}
	title={description}
	height="24"
	width="24" />

<span>Hello, {display_name}</span>
