const path = require('path');
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
	ps: {
		script: 'babel packages/ps/src --out-dir packages/ps/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/ps/src/index.js',
			dest: 'packages/ps/dist/ps.min.js',
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
	},
	framework: {
		script: 'babel packages/framework/src --out-dir packages/framework/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/framework/src/index.js',
			dest: 'packages/framework/dist/framework.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-authorize': {
		/* eslint-disable max-len */
		script: 'babel packages/mol-plugin-authorize/src --out-dir packages/mol-plugin-authorize/dist --copy-files --ignore **.test.js,**.md,examples/**',
		/* eslint-enable max-len */
		rollup: {
			entry: 'packages/mol-plugin-authorize/src/index.js',
			dest: 'packages/mol-plugin-authorize/dist/mol-plugin-authorize.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-location': {
		/* eslint-disable max-len */
		script: 'babel packages/mol-plugin-location/src --out-dir packages/mol-plugin-location/dist --copy-files --ignore **.test.js,**.md,examples/**',
		/* eslint-enable max-len */
		rollup: {
			entry: 'packages/mol-plugin-location/src/index.js',
			dest: 'packages/mol-plugin-location/dist/mol-plugin-location.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-promisify': {
		/* eslint-disable max-len */
		script: 'babel packages/mol-plugin-promisify/src --out-dir packages/mol-plugin-promisify/dist --copy-files --ignore **.test.js,**.md,examples/**',
		/* eslint-enable max-len */
		rollup: {
			entry: 'packages/mol-plugin-promisify/src/index.js',
			dest: 'packages/mol-plugin-promisify/dist/mol-plugin-promisify.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-query': {
		script: 'babel packages/mol-plugin-query/src --out-dir packages/mol-plugin-query/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/mol-plugin-query/src/index.js',
			dest: 'packages/mol-plugin-query/dist/mol-plugin-query.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-router': {
		script: 'babel packages/mol-plugin-router/src --out-dir packages/mol-plugin-router/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/mol-plugin-router/src/index.js',
			dest: 'packages/mol-plugin-router/dist/mol-plugin-router.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-source': {
		script: 'babel packages/mol-plugin-source/src --out-dir packages/mol-plugin-source/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/mol-plugin-source/src/index.js',
			dest: 'packages/mol-plugin-source/dist/mol-plugin-source.min.js',
			format: 'cjs'
		}
	},
	'mol-plugin-update': {
		script: 'babel packages/mol-plugin-update/src --out-dir packages/mol-plugin-update/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/mol-plugin-update/src/index.js',
			dest: 'packages/mol-plugin-update/dist/mol-plugin-update.min.js',
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
					// 如果没有被external, 又加载了第三方的包，确保第三方包的兼容性，重新编译
					// exclude: 'node_modules/**',
					babelHelpers: 'runtime'
				}),
				commonjs({}), 
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
					preventAssignment: false
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
