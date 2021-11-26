// 创建文件
exports.rootEntryInitial = (opts = {}) => {
	let contents = '';

	contents += `/**\n`;
	contents += ` * @file 用户映射，注册(初始化)\n`;
	contents += ` */\n`;
	contents += `\n`;
	// contents += `import Page from '../common/page';\n`;
	// contents += `import Component from '../common/component';\n`;
	contents += `import Store from './stores/root';\n`;
	contents += `\n`;
	contents += `Store.init();\n`;
	contents += `\n`;
	// contents += `export { \n`;
	// contents += `	Page,\n`;
	// contents += `	Component\n`;
	// contents += `};\n`;
	
	return contents;
};
