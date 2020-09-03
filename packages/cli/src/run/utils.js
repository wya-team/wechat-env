const { resolve } = require('path');
const fs = require('fs-extra');

exports.resolvePackage = (source, cwd) => {
	cwd = cwd || process.env.SOURCE_DIR || process.cwd();
	let nms = [
		resolve(__dirname, '../../node_modules', source),
		resolve(cwd, './node_modules', source),
		resolve(cwd, '../node_modules', source),
		...module.paths.map($path => resolve($path, source))
	];

	let fullpath = nms.find(i => fs.pathExistsSync(i));

	if (!fullpath) {
		throw new Error(`@wya/mp-cli: 未找到${source}`);
	}

	return fullpath;
};