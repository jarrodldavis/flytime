export function create_proxy_handler(transform) {
	return {
		get(target, property, receiver) {
			const value = Reflect.get(target, property, receiver);
			if (value === undefined) {
				throw new Error(`Environment variable '${property}' is not defined`);
			}

			const transformed = transform(value);
			if (transformed === null) {
				throw new Error(`Environment variable '${property}' is invalid`);
			}

			return transformed;
		}
	};
}

export function parse_string(value) {
	const parsed = value.trim();
	if (parsed.trim() === '') {
		return null;
	}

	return parsed;
}

export function parse_integer(value) {
	const parsed = parseInt(value, 10);
	if (isNaN(parsed) || parsed.toString() !== value) {
		return null;
	}

	return parsed;
}
