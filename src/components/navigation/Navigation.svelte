<script>
	import UserNavItem from './UserNavItem';

	export let segment;
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(170, 30, 30, 0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap-reverse;
	}

	li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding: 1em;
	}

	.user {
		display: flex;
		flex-direction: row;
		flex-grow: 1;
		justify-content: flex-end;
		align-items: center;
		padding: 0.5em 1em;
	}

	.selected {
		position: relative;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 2em);
		height: 2px;
		background-color: rgb(170, 30, 30);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
	}
</style>

<nav>
	<ul>
		<li class={segment === undefined ? 'selected' : ''}>
			<a href=".">home</a>
		</li>
		<li class={segment === 'about' ? 'selected' : ''}>
			<a href="about">about</a>
		</li>

		<!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
		<li class={segment === 'blog' ? 'selected' : ''}>
			<a rel="prefetch" href="blog">blog</a>
		</li>

		<li class="user">
			<UserNavItem />
		</li>
	</ul>
</nav>
