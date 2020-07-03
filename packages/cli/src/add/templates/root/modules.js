const { getNewContent } = require('../utils/helper');

exports.rootModules = (content, opts = {}) => {
	const { mutation, humpMutation, mutationWithPackage, pathArr, componentArr, obj } = opts;
	try {
		let importContent = `import ${humpMutation} from './${mutationWithPackage}/root';`;
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
