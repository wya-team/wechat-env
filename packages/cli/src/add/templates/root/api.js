const { getNewContent, getExtra } = require('../utils/helper');

exports.rootApi = (content, opts = {}) => {
	const { mutation, pathArr, componentArr, obj } = opts;
	try {
		let extra = getExtra(pathArr);
		let pathName = `${pathArr.slice(1).join('-')}`;
		let moduleName = `${mutation}${extra}`;

		let importContent = `import ${mutation} from './${mutation}';`;
		let injectContent = `	...${mutation}`;

		let importSplit = `\nconst API = {\n`;
		let injectSplit = `\n};\n`;

		return getNewContent({
			content,
			importContent,
			injectContent,
			importSplit,
			injectSplit
		});
	} catch (e) {
		console.log(e);
		return content;
	}
};

