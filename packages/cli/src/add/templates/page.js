const { getNewContent, getExtra } = require('./utils/helper');

exports.page = (opts = {}) => {
	const { mutation, humpMutation, pathArr, project, obj, title } = opts;
	let extra = getExtra(pathArr);
	let contents = '';
	const relativePath = packageName !== 'pages' ? '../' : '';

	contents += `<template>\n`;
	contents += `	<view>\n`;
	contents += `		__tpl__, ${pathArr.join('-')} ${title}\n`;
	contents += `	</view>\n`;
	contents += `</template>\n\n`;

	contents += `<script>\n`;
	contents += `import Page from '../../${relativePath}common/page';\n\n`;
	contents += `Page({\n`;
	contents += `	mapState(state) {\n`;
	contents += `		return {\n`;
	contents += `			...state.${humpMutation}${extra}\n`;
	contents += `		};\n`;
	contents += `	},\n`;
	contents += `	data: {\n`;
	contents += `	},\n`;
	contents += `	onShow() {\n`;
	contents += `	},\n`;
	contents += `	onLoad(options) {\n`;
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
