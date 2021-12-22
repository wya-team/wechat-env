const { resolve, dirname, relative, parse } = require('path');
const upath = require('upath');
const fs = require('fs-extra');
const { resolvePackage } = require('./utils');
const platform = require('./platform');

const MASTER_PACKAGE_NAME = 'pages';

let __cwd = process.env.SOURCE_DIR;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
let temp = process.env.TEMP_DIR;
let configFile = process.env.CONFIG_FILE_PATH;
let { subpackages = {} } = require(configFile); // eslint-disable-line

let hasRegenerator = fs.pathExistsSync(resolve(__cwd, './node_modules/regenerator-runtime'))
	|| fs.pathExistsSync(resolve(__cwd, '../node_modules/regenerator-runtime'));

let count = 0;
let cache = {}; // TODO: 前置编译 { '@wya/mp-polyfill': 'xx' }
let getModuleId = (key, packageName) => {
	// 0.13.5的版本微信无法执行
	if (hasRegenerator && key === '@babel/runtime/regenerator') {
		key = 'regenerator-runtime';
	}

	if (!cache[packageName]) {
		cache[packageName] = {};
	}

	if (!cache[packageName][key]) {
		cache[packageName][key] = `m${count++}`;

		// 副作用：写入文件
		fs.outputFileSync(
			`${temp}/${packageName !== MASTER_PACKAGE_NAME ? `${packageName}/` : ''}@@runtime.js`,
			Object.keys(cache[packageName]).reduce((pre, cur) => {
				pre += `exports.${cache[packageName][cur]} = require('${cur}');\n`;
				return pre;
			}, '')
		);
	}
	return cache[packageName][key];
};

let replacePlugins = [
	// 如wx. -> tt.
	[
		({ types: t }) => {
			return {
				visitor: {
					Identifier(path) {
						if (
							platform.globalApis.includes(path.node.name)
							&& path.node.name !== platform.globalApi 
							&& path.parent.type === 'MemberExpression'
						) {
							path.node.name = platform.globalApi;
						}
					}
				}
			};
		}
	]
];

let scriptPlugins = [
	// 如.wxs -> .sjs
	[
		({ types: t }) => {
			let regex = new RegExp(`\\.(${platform.scripts.join("|")})$`);
			let targetRegex = new RegExp(`\\.${platform.script}$`);
			return {
				visitor: {
					CallExpression(path) {
						let value = path.node.arguments && path.node.arguments[0] && path.node.arguments[0].value;
						if (
							path.node.callee.name === 'require' 
							&& regex.test(value) 
							&& !targetRegex.test(value)
						) {
							path.node.arguments[0].value = value.replace(regex, `.${platform.script}`);
						}
					},
					ImportDeclaration(path) {
						let { value } = path.node.source;
						if (regex.test(value) && !targetRegex.test(value)) {
							path.node.source.value = path.node.source.value.replace(regex, `.${platform.script}`);
						}
					}
				}
			};
		}
	]
];

let runtimePlugins = (from, to) => ([
	[
		resolvePackage('@babel/plugin-transform-runtime')
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

							let packageName = MASTER_PACKAGE_NAME;
							if (subpackages.length && !/node_modules/.test(filename)) {
								for (let i = 0; i < subpackages.length; i++) {
									let { name, dependencies = [] } = subpackages[i];
									if (
										filename.includes(`${from}/${name}`) 
										&& dependencies.some(i => i === moduleName)
									) {
										packageName = name;
									}
								}
							}

							let base = `${packageName !== MASTER_PACKAGE_NAME ? `${packageName}/` : ''}libs/@@runtime.js`;
							let fullpath = upath.normalize(relative(dirname(filename), resolve(from, relative(to, dist), base)));

							path.replaceWith(
								t.memberExpression(
									t.callExpression(t.identifier('require'), [t.stringLiteral(fullpath)]),
									t.identifier(getModuleId(moduleName, packageName))
								)
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
	],
	...replacePlugins
]);
const babelConfig = (opts = {}) => {
	const { runtimeHelpers = true, from, to } = opts;
	return {
		presets: [resolvePackage('@babel/preset-env')],
		plugins: [
			resolvePackage('@babel/plugin-proposal-export-namespace-from'),
			resolvePackage('@babel/plugin-proposal-export-default-from'),
			resolvePackage('@babel/plugin-proposal-function-bind'),
			resolvePackage('@babel/plugin-syntax-dynamic-import'),
			[
				resolvePackage('@babel/plugin-proposal-object-rest-spread'), 
				{ 
					"loose": true 
				}
			],
			[
				resolvePackage('@babel/plugin-proposal-decorators'),
				{
					"legacy": true
				}
			],
			[	
				resolvePackage('@babel/plugin-proposal-class-properties'),
				{
					"assumptions": {
						"setPublicClassFields": true
					}
				}
			]
		].concat(runtimeHelpers ? runtimePlugins(from, to) : [])
	};
};

exports.babelConfig = babelConfig;
exports.replacePlugins = replacePlugins;
exports.scriptPlugins = scriptPlugins;
