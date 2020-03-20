const { resolve, dirname, relative, parse } = require('path');
const upath = require('upath');
const fs = require('fs-extra');

let __cwd = process.env.SOURCE_DIR;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
let temp = process.env.TEMP_DIR;
let hasRegenerator = fs.pathExistsSync(resolve(__cwd, './node_modules/regenerator-runtime'));

let count = 0;
let cache = {};
let getModuleId = (key) => {

	// 0.13.5的版本微信无法执行
	if (hasRegenerator && key === '@babel/runtime/regenerator') {
		key = 'regenerator-runtime';
	}

	if (!cache[key]) {
		cache[key] = `m${count++}`;

		// 副作用：写入文件
		fs.outputFileSync(
			`${temp}/@@runtime.js`,
			Object.keys(cache).reduce((pre, cur) => {
				pre += `exports.${cache[cur]} = require('${cur}');\n`;
				return pre;
			}, '')
		);
	}
	return cache[key];
};
let r = (source) => {
	let fullpath;

	fullpath = resolve(__dirname, '../../node_modules', source);
	if (fs.pathExistsSync(fullpath)) {
		return fullpath;
	}
	
	fullpath = resolve(__cwd, './node_modules', source);
	if (fs.pathExistsSync(fullpath)) {
		return fullpath;
	}

	throw new Error(`@wya/mp-cli: 未找到${source}`);
};

let runtimePlugins = [
	[
		r('@babel/plugin-transform-runtime')
	],
	[
		({ types: t }) => {
			return {
				visitor: {
					// 不使用ImportDeclaration, babel转义使用的是require
					CallExpression(path, { filename }) {
						let moduleName = path.node.arguments[0] && path.node.arguments[0].value;
						let methodName = path.node.callee.name;

						if (!moduleName 
							|| !moduleName.includes 
							|| moduleName.includes('./') 
							|| moduleName.includes('..')
						) return;
						if (methodName === 'require' 
							&& !moduleName.includes('@@runtime.js')
						) {

							let fullpath = upath.normalize(relative(dirname(filename), resolve(src, 'libs/@@runtime.js')));

							path.replaceWith(
								t.memberExpression(
									t.callExpression(t.identifier('require'), [t.stringLiteral(fullpath)]),
									t.identifier(getModuleId(moduleName))
								),
							);
						}
					}
				},
			};
		}
	],
	[
		({ types: t }) => {
			return {
				visitor: {
					MemberExpression(path) {
						const hasNodeENV = path.matchesPattern("process.env.NODE_ENV");
						const hasBranch = path.matchesPattern("process.env.BRANCH");
						const hasCustom = path.matchesPattern("process.env.CUSTOM");
						
						// 发布分支, 
						if (hasNodeENV || hasBranch || hasCustom) {
							hasNodeENV && path.replaceWith(t.valueToNode(process.env.NODE_ENV));
							hasBranch && path.replaceWith(t.valueToNode(process.env.BRANCH));
							hasCustom && path.replaceWith(t.valueToNode(process.env.CUSTOM));

							if (path.parentPath.isBinaryExpression()) {
								const evaluated = path.parentPath.evaluate();
								if (evaluated.confident) {
									path.parentPath.replaceWith(t.valueToNode(evaluated.value));
								}
							}
						}
					}
				}
			};
		}
	]
];
const babelConfig = (opts = {}) => {
	const { runtimeHelpers = true } = opts;
	return {
		presets: [r('@babel/preset-env')],
		plugins: [
			r('@babel/plugin-proposal-export-namespace-from'),
			r('@babel/plugin-proposal-export-default-from'),
			r('@babel/plugin-proposal-function-bind'),
			r('@babel/plugin-syntax-dynamic-import'),
			[
				r('@babel/plugin-proposal-object-rest-spread'), 
				{ 
					"loose": true 
				}
			],
			[
				r('@babel/plugin-proposal-decorators'),
				{
					"legacy": true
				}
			],
			[	
				r('@babel/plugin-proposal-class-properties'),
				{
					"loose": true
				}
			]
		].concat(runtimeHelpers ? runtimePlugins : [])
	};
};

module.exports = babelConfig;