const restrictions = {
	process: [
		{
			selector:
				'MemberExpression[object.name="process"][property.name="browser"]',
			message: 'Unexpected use of process.browser.'
		},
		{
			selector:
				'MemberExpression[object.name="process"][property.name="package"]',
			message: 'Unexpected use of process.package.'
		}
	],
	query: [
		{
			// this targets the first argument of any call expression when the
			// callee is a function or method named `query` and the argument is
			// *not* a `sql`-tagged template expression
			selector:
				'CallExpression:has(.callee:has(Identifier[name="query"])) .arguments:first-child:not(TaggedTemplateExpression[tag.name="sql"])',
			message:
				'Invalid usage of `query`: expected argument to be a `sql`-tagged template expression.'
		},
		{
			// this targets any non-first argument of a call expression when the
			// callee is a function or method named `query`
			selector:
				'CallExpression:has(.callee:has(Identifier[name="query"])) .arguments:not(:first-child)',
			message: "Invalid usage of 'query': too many arguments."
		}
	],
	pg: [
		{
			selector: 'ImportDeclaration .source[value=/^pg/]',
			message: "Unexpected usage of the 'pg' package."
		}
	],
	pool: [
		{
			selector: 'Identifier[name="postgres_pool"]',
			message: "Unexpected usage of 'postgres_pool' outside query definition."
		}
	],
	squid: [
		{
			selector: 'ImportDeclaration .source[value=/^squid/]',
			message:
				"Unexpected usage of the 'squid' package outside query definition."
		}
	]
};

function flatten(arrays) {
	return ['error'].concat(...arrays);
}

function all() {
	return flatten(Object.values(restrictions));
}

const valid_types = new Set(Object.keys(restrictions));
function except(...types) {
	if (!types.every(valid_types.has, valid_types)) {
		throw new Error(`One or more restriction types are invalid: ${types}`);
	}

	const ignore = new Set(types);
	return flatten(
		Object.entries(restrictions)
			.filter(([key]) => !ignore.has(key))
			.map(([_, value]) => value)
	);
}

module.exports = { all, except };
