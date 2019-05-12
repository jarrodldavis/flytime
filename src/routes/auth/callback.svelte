<script context="module">
	export function preload(_page, session) {
		// if there's no session error, something went really wrong
		if (!session.error) {
			this.error(500, 'Application Error');
		}
	}
</script>
