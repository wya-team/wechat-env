const { getNewContent, getStoreKey } = require('../utils/helper');

// 子包使用
exports.rootApiInitial = (content, opts = {}) => {
	let contents = '';
	contents += `import { RegEx } from '@wya/mp-utils';\n`;
	contents += `\nconst API = {`;
	contents += `\n	// ...[modules]`;
	contents += `\n};`;
	contents += `\nexport default API;\n`;
	
	return contents;
};

exports.rootApi = (content, opts = {}) => {
	const { mutation, pathArr, componentArr, obj } = opts;
	try {
		let pathName = `${pathArr.slice(1).join('-')}`;

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

