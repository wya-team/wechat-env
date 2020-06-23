const { getNewContent } = require('../utils/helper');

exports.rootModules = (content, opts = {}) => {
	const { mutation, humpMutation, pathArr, componentArr, obj } = opts;
	try {
		let importContent = `import ${humpMutation} from './${mutation}/root';`;
		let injectContent = `	...${humpMutation}`;

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
