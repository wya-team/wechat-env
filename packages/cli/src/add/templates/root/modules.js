const { getNewContent, camelCase } = require('../utils/helper');

// 创建文件，子包使用
exports.rootModulesInitial = (content, opts = {}) => {
	let contents = '';
	contents += `\n\nexport default {`;
	contents += `\n	// ...[modules]`;
	contents += `\n};\n`;
	
	return contents;
};

exports.rootModules = (content, opts = {}) => {
	const { mutation, pathArr, componentArr, obj } = opts;
	const key = camelCase(mutation);
	try {
		let importContent = `import ${key} from './${mutation}/root';`;
		let injectContent = `	...${key}`;

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
		return content;
	}
};
