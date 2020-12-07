const { getNewContent } = require('../utils/helper');

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
