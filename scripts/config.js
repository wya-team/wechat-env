const path = require('path');
const buble = require('@rollup/plugin-buble');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');
const helperModelImports = require('@babel/helper-module-imports');
let wm = new WeakMap();

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
						],
						[
							({ types: t }) => {
								return {
									visitor: {
										CallExpression(path) {
											let callee = path.get('callee');

											if (callee.node && callee.node.object && callee.node.property) {
												if (t.isIdentifier(callee.node.object, { name: 'regeneratorRuntime' })) {
													let programPath = path.scope.getProgramParent().path;
													let runtimeId;

													if (wm.has(programPath.node)) {
														runtimeId = t.identifier(wm.get(programPath.node));
													} else {
														runtimeId = helperModelImports.addDefault(programPath, 'regenerator-runtime', {
															nameHint: 'regeneratorRuntime',
															importedInterop: 'uncompiled',
															blockHoist: 3
														});
														wm.set(programPath.node, runtimeId.name);
													}
													callee.node.object.name = runtimeId.name;
												}
											}
										}
									}
								};
							}
						],
						"@babel/plugin-transform-runtime"

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
				})
				// process.env.NODE_ENV === 'production' && uglify()
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
