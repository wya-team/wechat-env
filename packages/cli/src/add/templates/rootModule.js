const { getNewContent, getExtra } = require('./utils/helper');

exports.rootModule = (opts = {}) => {
	const { mutation, pathArr, componentArr, obj } = opts;

	let extra = getExtra(pathArr);
	let pathName = `${pathArr.slice(1).join('-')}`;
	let moduleName = `${mutation}${extra}`;

	let contents = '';
	contents += `import { ${moduleName} } from './${pathName}';\n`;
	contents += `\nexport default {\n`;
	contents += `	${moduleName}`;
	contents += `\n};\n`;
	return contents;
};

exports.rootModuleOverride = (content, opts = {}) => {
	const { mutation, pathArr, componentArr, obj } = opts;
	try {
		let extra = getExtra(pathArr);
		let pathName = `${pathArr.slice(1).join('-')}`;
		let moduleName = `${mutation}${extra}`;
		
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
