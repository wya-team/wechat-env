const path = require('path');
const buble = require('@rollup/plugin-buble');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');

const builds = {
	store: {
		entry: 'packages/store/src/index.js',
		dest: 'packages/store/dist/index.js',
		env: process.env.NODE_ENV,
		format: 'cjs'
	},
	utils: {
		entry: 'packages/utils/src/index.js',
		dest: 'packages/utils/dist/index.js',
		env: process.env.NODE_ENV,
		format: 'cjs'
	},
	http: {
		entry: 'packages/utils/src/index.js',
		dest: 'packages/utils/dist/index.js',
		env: process.env.NODE_ENV,
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
				commonjs({}), 
				replace({
					'process.env.NODE_ENV': JSON.stringify(opt.env),
				}),
				buble({
					objectAssign: 'Object.assign' // ...Object spread and rest
				})
			].concat(opt.options || []),
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
