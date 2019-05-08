<script>
	export let href;
	export let image;
	export let description;
	export let height;
	export let width;

	$: image_url = `/${image}.png`;
	$: retina_image_url = `/${image}@2x.png`;
</script>

<style>
	a {
		line-height: 0;
		text-decoration: none;
	}
</style>

<a {href}>
	<img
		src={image_url}
		srcset="{image_url} 1x, {retina_image_url} 2x"
		alt={description}
		{height}
		{width} />
</a>
