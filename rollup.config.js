import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import acorn_class_fields from 'acorn-class-fields';
import config from 'sapper/config/rollup.js';

import { builtinModules } from 'module';
import { name, version, dependencies } from './package.json';

/* eslint-disable no-process-env */
const mode = process.env.NODE_ENV;
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
/* eslint-enable no-process-env */

const dev = mode === 'development';
const extensions = ['.mjs', '.js', '.svelte'];
const resolve_extensions = [...extensions, '.json', '.node'];

const replacements = {
	'process.env.NODE_ENV': JSON.stringify(mode),
	'process.package.name': JSON.stringify(name),
	'process.package.version': JSON.stringify(version)
};

export default {
	client: {
		input: config.client.input(),
		output: { ...config.client.output(), sourcemap: true },
		watch: { chokidar: true },
		acornInjectPlugins: [acorn_class_fields],
		plugins: [
			replace({ ...replacements, 'process.browser': true }),
			svelte({ dev, hydratable: true, emitCss: true }),
			resolve({ extensions: resolve_extensions }),
			commonjs(),

			legacy &&
				babel({
					extensions,
					runtimeHelpers: true,
					exclude: ['node_modules/@babel/**'],
					presets: [['@babel/preset-env', { targets: '> 0.25%, not dead' }]],
					plugins: [
						'@babel/plugin-syntax-dynamic-import',
						['@babel/plugin-transform-runtime', { useESModules: true }]
					]
				}),

			!dev && terser({ module: true })
		]
	},

	server: {
		input: config.server.input(),
		manualChunks: {
			// force into separate chunk to ensure early registration of handlers
			shutdown: ['src/server/shutdown.js']
		},
		output: { ...config.server.output(), sourcemap: true },
		watch: { chokidar: true },
		acornInjectPlugins: [acorn_class_fields],
		plugins: [
			replace({ ...replacements, 'process.browser': false }),
			svelte({ generate: 'ssr', dev }),
			resolve({ extensions: resolve_extensions }),
			commonjs()
		],
		external: [...Object.keys(dependencies), ...builtinModules]
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		watch: { chokidar: true },
		acornInjectPlugins: [acorn_class_fields],
		plugins: [
			replace({ ...replacements, 'process.browser': true }),
			resolve({ extensions: resolve_extensions }),
			commonjs(),
			!dev && terser()
		]
	}
};
