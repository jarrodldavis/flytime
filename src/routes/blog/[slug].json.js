import posts from './_posts.js';

const lookup = new Map();
posts.forEach(post => {
	lookup.set(post.slug, post);
});

export function get(req, res) {
	// the `slug` parameter is available because
	// this file is called [slug].json.js
	const { slug } = req.params;

	if (lookup.has(slug)) {
		res.send(200, lookup.get(slug));
	} else {
		res.send(404, { message: 'Not found' });
	}
}
