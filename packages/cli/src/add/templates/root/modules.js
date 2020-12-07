const { getNewContent } = require('../utils/helper');

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
	try {
		let importContent = `import ${mutation} from './${mutation}/root';`;
		let injectContent = `	...${mutation}`;

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
