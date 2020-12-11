const { getNewContent, getStoreKey, camelCase } = require('../utils/helper');

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
	const key = camelCase(mutation);
	try {
		let pathName = `${pathArr.slice(1).join('-')}`;

		let importContent = `import ${key} from './${mutation}';`;
		let injectContent = `	...${key}`;

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

