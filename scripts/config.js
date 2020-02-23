const path = require('path');
const buble = require('@rollup/plugin-buble');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');

const builds = {
	store: {
		entry: 'packages/store/src/index.js',
		dest: 'packages/store/dist/index.js',
		format: 'cjs'
	},
	utils: {
		entry: 'packages/utils/src/index.js',
		dest: 'packages/utils/dist/index.js',
		format: 'cjs'
	},
	http: {
		entry: 'packages/http/src/index.js',
		dest: 'packages/http/dist/index.js',
		format: 'cjs'
	}
};

class Config {
	static getConfig = (name) => {
		let opt = builds[name];
		let config = {
			input: opt.entry,
			external: opt.external,
			plugins: [
				nodeResolve(), 
				babel({
					babelrc: false,
					presets: ['@babel/preset-env'],
					plugins: [
						[
							"@babel/plugin-proposal-class-properties",
							{
								"loose": true
							}
						]
					],
					exclude: 'node_modules/**',
					runtimeHelpers: true
				}),
				commonjs({}), 
				buble({
					objectAssign: 'Object.assign' // ...Object spread and rest
				}),
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
				}),
				process.env.NODE_ENV === 'production' && uglify()
			],
			output: {
				file: opt.dest,
				format: opt.format,
				named: opt.moduleName || name,
				exports: 'named'
			}
		};
		return config;
	}

	static getAllBuilds = () => {
		return Object.keys(builds).map(Config.getConfig);
	}
}

module.exports = Config;
