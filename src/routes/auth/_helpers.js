export function sapper_fallback(fn) {
	return async function(req, res, next) {
		if (res.err) {
			// fallback to Sapper error page
			return next();
		}

		try {
			await fn(req, res);
		} catch (error) {
			res.err = error;
			// fallback to Sapper error page
			return next();
		}
	};
}
