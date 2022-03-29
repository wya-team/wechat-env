const { getNewContent, getStoreKey } = require('./utils/helper');

exports.page = (opts = {}) => {
	const { mutation, packageName, pathArr, project, obj, title, store } = opts;
	let storeKey = getStoreKey(pathArr, packageName);
	let contents = '';

	contents += `<template>\n`;
	contents += `	<view>\n`;
	contents += `		__tpl__, ${pathArr.join('-')} ${title} ${storeKey}\n`;
	contents += `	</view>\n`;
	contents += `</template>\n\n`;

	contents += `<script>\n`;

	contents += `import Mol from '@wya/mol';\n`;
	if (packageName !== 'pages') { 
		contents += `import '../../index';\n`;
	}
	
	contents += `\nMol.page({\n`;

	if (store) {
		contents += `	mapState(state) {\n`;
		contents += `		return {\n`;
		contents += `			...state.${storeKey}\n`;
		contents += `		};\n`;
		contents += `	},\n`;
	}
	
	contents += `	data: {\n`;
	contents += `	},\n`;
	contents += `	onShow() {\n`;
	contents += `	},\n`;
	contents += `	onLoad() {\n`;
	contents += `	},\n`;
	contents += `});\n`;
	contents += `</script>\n\n`;
	contents += `<style lang="scss">\n`;
	contents += `</style>\n\n`;
	contents += `<config>\n`;
	contents += `{\n`;
	contents += `	"navigationBarTitleText": "${title}",\n`;
	contents += `	"usingComponents": {}\n`;
	contents += `}\n`;
	contents += `</config>\n`;
	return contents;
};
