const { resolve, dirname, relative } = require('path');
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

							// 写文件
							if (!cache[value] && fs.existsSync(pkgPath)) {
								let { main } = JSON.parse(fs.readFileSync(pkgPath));

								let dir = dirname(resolve(thirdPath, main));
								let pkgDir = main.split('/');
								pkgDir.pop();
								let cpPath = resolve(dist, 'libs', value, pkgDir.join('/'));

								fs.copySync(dir, cpPath);

								console.log(`源文件已拷贝到目标文件: ${cpPath}`);
								cache[value] = {
									main
								};
							}

							// 赋值
							if (cache[value]) {
								let fullpath;
								try {
									fullpath = relative(dirname(filename), resolve(src, 'libs', value, cache[value].main))
								} catch (e) {
									console.error(e, '请检查文件', filename, value, cache[value].main);
								}
								path.node.source.value = fullpath;
							}
						}
					}
				}
			]
		]
	};
})();

module.exports = babelConfig;