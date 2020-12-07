
// 创建文件，子包使用
exports.rootStoreInitial = (opts = {}) => {
	let contents = '';

	contents += `import APIManager from '../../stores/apis/root';\n`;
	contents += `import modules from './modules/root';\n`;
	contents += `import apis from './apis/root';\n`;
	contents += `\n`;
	contents += `export default class Store {\n`;
	contents += `	static init() {\n`;
	contents += `		const { store } = getApp();\n`;
	contents += `		APIManager.inject(apis);\n`;
	contents += `		store.addModules(modules);\n`;
	contents += `	}\n`;
	contents += `}\n`;
	
	return contents;
};
