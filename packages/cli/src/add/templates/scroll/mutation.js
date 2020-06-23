const { getNewContent, getMutationType } = require('../utils/helper');

exports.mutation = (content, opts = {}) => {
	const { mutation, pathArr, project, obj } = opts;
	try {
		if (pathArr.includes('list') === false) {
			let mutationType = getMutationType(pathArr) + '_GET';
			let _mutationType = getMutationType(pathArr) + '_LIST_GET';

			// 旧的保留
			// let oldContent = `export const ${mutationType} = '${mutationType}';`;
			let newContent = `export const ${_mutationType} = '${_mutationType}';`;


			if (content.includes(newContent) === false) {
				content += `${newContent}\n`;
			}
		}
		return content;
	} catch (e) {
		console.log(e);
		return content;
	}
};

