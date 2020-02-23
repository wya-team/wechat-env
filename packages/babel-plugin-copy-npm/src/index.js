const { resolve, dirname, relative } = require('path');
const fs = require('fs-extra');

const ROOT = process.cwd();
function letToVar(babel) {
	const { types: t, template } = babel;
	const visitor = {
		ImportDeclaration(path, { opts = {}, filename }) {
			let { value } = path.node.source;
			let { output } = opts;
			let absolutePath = resolve(ROOT, `node_modules/${value}`);
			let pakcagePath = resolve(absolutePath, `package.json`);
			if (fs.existsSync(pakcagePath)) {
				let config = JSON.parse(fs.readFileSync(pakcagePath));
				let { main } = config;
				let dir = dirname(resolve(absolutePath, main));
				let targetPath = resolve(ROOT, output, value);
				fs.copy(dir, targetPath, (err) => {
					console.log(err);
					console.log('源文件已拷贝到目标文件');
				});
				
				path.node.source.value = './' + relative(dirname(filename), targetPath);
			}
		}
	};
	return { visitor };
}
  
module.exports = letToVar;