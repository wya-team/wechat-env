exports.item = (content, opts = {}) => {
	const { mutation, pathArr, packageName, project, obj, title } = opts;
	let contents = '';

	contents += `<template>\n`;
	contents += `	<view>\n`;
	contents += `		__tpl__\n`;
	contents += `	</view>\n`;
	contents += `</template>\n\n`;
	contents += `<script>\n`;
	
	if (packageName === 'pages') { 
		contents += `import Component from '../../../common/component';\n\n`;
	} else {
		contents += `import { Component } from '../../../index';\n\n`;
	}
	
	contents += `Component({\n`;
	contents += `	properties: {\n`;
	contents += `		it: {\n`;
	contents += `			type: Object,\n`;
	contents += `			value: {}\n`;
	contents += `		}\n`;
	contents += `	},\n`;
	contents += `	data: {\n`;
	contents += `	},\n`;
	contents += `	lifetimes: {\n`;
	contents += `		 attached() { },\n`;
	contents += `	},\n`;
	contents += `	methods: {\n`;
	contents += `	},\n`;
	contents += `});\n`;
	contents += `</script>\n\n`;
	contents += `<style lang="scss">\n\n`;
	contents += `</style>\n\n`;
	contents += `<config>\n`;
	contents += `{\n`;
	contents += `	"component": true\n`;
	contents += `}\n`;
	contents += `</config>\n`;
	return contents;
};
