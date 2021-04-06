const path = require('path');
const buble = require('@rollup/plugin-buble');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const helperModelImports = require('@babel/helper-module-imports');

let wm = new WeakMap();

const builds = {
	cli: {
		script: 'babel packages/cli/src --out-dir packages/cli/dist --copy-files --ignore **.test.js,**.md,examples/**',
	},
	store: {
		script: 'babel packages/store/src --out-dir packages/store/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/store/src/index.js',
			dest: 'packages/store/dist/store.min.js',
			format: 'cjs'
		}
	},
	polyfill: {
		script: 'babel packages/polyfill/src --out-dir packages/polyfill/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/polyfill/src/index.js',
			dest: 'packages/polyfill/dist/polyfill.min.js',
			format: 'cjs'
		}
	},
	utils: {
		script: 'babel packages/utils/src --out-dir packages/utils/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/utils/src/index.js',
			dest: 'packages/utils/dist/utils.min.js',
			format: 'cjs'
		}
	},
	http: {
		script: 'babel packages/http/src --out-dir packages/http/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/http/src/index.js',
			dest: 'packages/http/dist/http.min.js',
			format: 'cjs'
		}
	}
};

class Config {
	static getConfig = (name) => {
		return {
			...builds[name],
			rollup: Config.getRollupConfig(name)
		};
	}

	static getRollupConfig = (name) => {
		let opts = builds[name].rollup;
		if (!opts) return;

		let config = {
			input: opts.entry,
			external: opts.external,
			plugins: [
				nodeResolve(), 
				babel({
					babelrc: true,
					exclude: 'node_modules/**',
					babelHelpers: 'runtime'
				}),
				commonjs({}), 
				buble({
					objectAssign: 'Object.assign' // ...Object spread and rest
				}),
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
				})
				// process.env.NODE_ENV === 'production' && terser()
			],
			output: {
				file: opts.dest,
				format: opts.format,
				// named: opts.moduleName || name,
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
