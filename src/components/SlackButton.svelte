<script>
	const image_url = `/slack-button.png`;
	const retina_image_url = `/slack-button@2x.png`;
	const description = 'Add to Slack';
</script>

<style>
	a {
		line-height: 0;
		text-decoration: none;
	}
</style>

<a href="/auth/sign-in">
	<img
		src={image_url}
		srcset="{image_url} 1x, {retina_image_url} 2x"
		alt={description}
		title={description}
		width="139"
		height="40" />
</a>
