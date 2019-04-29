/**
 * @param {import("@slack/bolt").App} app
 */
export function add_slack_events(app) {
	app.use(({ context }) => (context.client = app.client));
}
