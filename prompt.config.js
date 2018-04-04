/**
 * 强化项目的读写能力
 */
const prompt = require('prompt');
const fs = require('fs-extra');
// 开始写入
prompt.start();
prompt.get(['GUID', 'HOST'],  (err, result) =>  {
	let contents = '';
	// 对用户输入的信息处理
	// to do ....
	let strObj = result || {};

	/**
	 * 商家识别码
	 */
	contents += `/**\n`;
	contents += ` * 商家识别码\n`;
	contents += ` */\n`;
	contents += `export const GUID = "${result.GUID || "test"}";\n`;
	contents += `export const HOST = "${result.HOST || "ruishan666"}";\n`;
	fs.outputFileSync('./src/config.js', contents);
});