const { getNewContent, getStoreKey } = require('./utils/helper');

exports.rootModule = (opts = {}) => {
	const { mutation, packageName, pathArr, componentArr, obj } = opts;

	let pathName = `${pathArr.slice(1).join('-')}`;
	let moduleName = getStoreKey(pathArr, packageName);

	let contents = '';
	contents += `import { ${moduleName} } from './${pathName}';\n`;
	contents += `\nexport default {\n`;
	contents += `	${moduleName}`;
	contents += `\n};\n`;
	return contents;
};

exports.rootModuleOverride = (content, opts = {}) => {
	const { mutation, packageName, pathArr, componentArr, obj } = opts;
	try {
		let pathName = `${pathArr.slice(1).join('-')}`;
		let moduleName = getStoreKey(pathArr, packageName);
		
		let importContent = `import { ${moduleName} } from './${pathName}';`;
		let injectContent = `	${moduleName},`;

		let importSplit = `\nexport default {\n`;
		let injectSplit = `\n};\n`;

		return getNewContent({
			content,
			importContent,
			injectContent,
			importSplit,
			injectSplit
		});
	} catch (e) {
		console.log('e', e);
		return content;
	}
};
