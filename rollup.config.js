import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';

/* eslint-disable no-process-env */
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
const resolve_extensions = ['.mjs', '.js', '.json', '.node', '.svelte'];
/* eslint-enable no-process-env */

export default {
	client: {
		input: config.client.input(),
		output: { ...config.client.output(), sourcemap: true },
		watch: { chokidar: true },
		plugins: [
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			svelte({
				dev,
				hydratable: true,
				emitCss: true
			}),
			resolve({ extensions: resolve_extensions }),
			commonjs(),

			legacy &&
				babel({
					extensions: ['.js', '.mjs', '.html', '.svelte'],
					runtimeHelpers: true,
					exclude: ['node_modules/@babel/**'],
					presets: [
						[
							'@babel/preset-env',
							{
								targets: '> 0.25%, not dead'
							}
						]
					],
					plugins: [
						'@babel/plugin-syntax-dynamic-import',
						[
							'@babel/plugin-transform-runtime',
							{
								useESModules: true
							}
						]
					]
				}),

			!dev &&
				terser({
					module: true
				})
		]
	},

	server: {
		input: config.server.input(),
		output: { ...config.server.output(), sourcemap: true },
		watch: { chokidar: true },
		plugins: [
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			svelte({
				generate: 'ssr',
				dev
			}),
			resolve({ extensions: resolve_extensions }),
			commonjs()
		],
		external: Object.keys(pkg.dependencies).concat(
			require('module').builtinModules ||
				Object.keys(process.binding('natives'))
		)
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		watch: { chokidar: true },
		plugins: [
			resolve({ extensions: resolve_extensions }),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser()
		]
	}
};
