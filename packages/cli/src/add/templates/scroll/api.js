const { getNewContent, getMutationType } = require('../utils/helper');

exports.api = (content, opts = {}) => {
	const { mutation, pathArr, packageName, project, obj } = opts;
	
	try {
		if (pathArr.includes('list') === false) {
			let importContent;
			let injectContent = `	${getMutationType(pathArr, packageName)}_LIST_GET: '/test'`;

			let importSplit;
			let injectSplit = `\n};\n`;

			return getNewContent({
				content,
				importContent,
				injectContent,
				importSplit,
				injectSplit
			});
		} else {
			return content;
		}
	} catch (e) {
		console.log(e);
		return content;
	}
};

