const { resolve, dirname, relative } = require('path');
const upath = require('upath');
const fs = require('fs-extra');

let __cwd = process.env.SOURCE_DIR;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;

let count = 0;
let cache = {};
let getModuleId = (key) => {
	cache[key] = cache[key] || `module${count++}`;

	return cache[key];
};

const babelConfig = (() => {
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
			],

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

								if (!moduleName || moduleName.includes('./') || moduleName.includes('..')) return;
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
						}
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
		]
	};
})();

module.exports = babelConfig;