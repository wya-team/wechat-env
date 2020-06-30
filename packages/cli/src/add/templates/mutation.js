const { getMutationType } = require('./utils/helper');

exports.mutation = (opts = {}) => {
	const { pathArr, obj, packageName } = opts;
	let mutationType = getMutationType(pathArr, packageName) + '_GET';
	let contents = '';
	contents += `/**\n`;
	contents += ` * 请注释模块内容\n`;
	contents += ` */\n`;
	contents += `export const ${mutationType} = '${mutationType}';\n`;
	return contents;
};

exports.mutationOverride = (content, opts = {}) => {
	const { pathArr, obj, packageName } = opts;
	let mutationType = getMutationType(pathArr, packageName) + '_GET';
	let newContent = '';
	newContent += `export const ${mutationType} = '${mutationType}';`;

	if (content.includes(newContent) === false) {
		content += `${newContent}\n`;
	}

	return content;
};

