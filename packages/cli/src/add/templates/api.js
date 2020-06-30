const { getNewContent, getMutationType } = require('./utils/helper');

exports.api = (opts = {}) => {
	const { mutation, pathArr, packageName, project, obj } = opts;
	
	let contents = '';
	contents += `const api = {\n`;
	contents += `	/**\n`;
	contents += `	 * 请注释模块内容\n`;
	contents += `	 */\n`;
	contents += `	${getMutationType(pathArr, packageName)}_GET: ''`;
	contents += `\n};\n`;
	contents += `export default api;\n`;
	return contents;
};

exports.apiOverride = (content, opts = {}) => {
	const { mutation, pathArr, packageName, project, obj } = opts;
	
	try {
		let importContent;
		let injectContent = `	${getMutationType(pathArr, packageName)}_GET: ''`;

		let importSplit;
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

