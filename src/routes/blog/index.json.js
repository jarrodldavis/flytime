import posts from './_posts.js';

const contents = posts.map(post => {
	return {
		title: post.title,
		slug: post.slug
	};
});

export function get(req, res) {
	res.send(200, contents);
}
