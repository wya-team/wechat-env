const { getNewContent, getExtra } = require('../utils/helper');

exports.rootApi = (content, opts = {}) => {
	const { mutation, humpMutation, pathArr, componentArr, obj } = opts;
	try {
		let extra = getExtra(pathArr);
		let pathName = `${pathArr.slice(1).join('-')}`;
		let moduleName = `${humpMutation}${extra}`;

		let importContent = `import ${humpMutation} from './${mutation}';`;
		let injectContent = `	...${humpMutation}`;

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

