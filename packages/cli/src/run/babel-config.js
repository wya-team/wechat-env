const { resolve, dirname, relative } = require('path');
const upath = require('upath');
const fs = require('fs-extra');

let __cwd = process.env.SOURCE_DIR;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;

let cache = {};

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
				r('@babel/plugin-transform-runtime')
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
				{
					visitor: {
						ImportDeclaration(path, { filename }) {
							let { value } = path.node.source;
							if (!value || value.includes('./') || value.includes('..')) return;

							let thirdPath = resolve(__cwd, `node_modules/${value}`);
							let pkgPath = resolve(thirdPath, `package.json`);

							let hasPkg = fs.existsSync(pkgPath);
							let isJS = fs.existsSync(thirdPath.includes('.js') ? thirdPath : `${thirdPath}.js`);
							let hasJS = fs.existsSync(thirdPath + '/index.js');
							
							// 写文件
							if (!cache[value] && (hasPkg || hasJS || isJS)) {

								let main;
								let dir;
								let cpPath;
								if (hasPkg) {
									let pkgDir;
									main = JSON.parse(fs.readFileSync(pkgPath)).main;

									dir = dirname(resolve(thirdPath, main));
									pkgDir = main.split('/');
									pkgDir.pop();
									cpPath = resolve(dist, 'libs', value, pkgDir.join('/'));

									fs.copySync(dir, cpPath);
									console.log(`源文件已拷贝到目标文件1: ${cpPath}`);
								}

								if (isJS || hasJS) {
									main = hasJS ? '/index.js' : value.includes('.js') ? '' : `.js`;

									dir = resolve(thirdPath + main);
									cpPath = resolve(dist, 'libs', value) + main;

									fs.copySync(dir, cpPath);
									console.log(`源文件已拷贝到目标文件2: ${cpPath}`);
								} 

								cache[value] = {
									main
								};
							}

							// 赋值
							if (cache[value]) {
								let fullpath;
								try {
									fullpath = relative(dirname(filename), resolve(src, 'libs', value) + cache[value].main);
								} catch (e) {
									console.error(e, '请检查文件', filename, value, cache[value].main);
								}

								path.node.source.value = upath.normalize(fullpath);
							}
						}
					}
				}
			],
			[
				({ types: t }) => {
					return {
						visitor: {
							MemberExpression(path) {
								if (path.matchesPattern("process.env.NODE_ENV")) {
									path.replaceWith(t.valueToNode(process.env.NODE_ENV));

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