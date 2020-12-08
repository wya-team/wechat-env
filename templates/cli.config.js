const { resolve } = require('path');

module.exports = {
	alias: {
		'@components': resolve(__dirname, './src/components'),
		'@stores': resolve(__dirname, './src/stores'),
		'@utils': resolve(__dirname, './src/utils'),
		'@common': resolve(__dirname, './src/common'),
		'@constants': resolve(__dirname, './src/constants'),
		'@pages': resolve(__dirname, './src/pages'),
	},
	copies: [
		{
			name: '@wya/mc',
			enforce: 'pre', // 需要预编译
			from: resolve(__dirname, './node_modules/@wya/mc', './src/'),
			to: resolve(__dirname, './dist', './libs/mc'),
			options: {
				// ignore: ['rich-text', 'echarts']
			}
		}
	],
	/**
	 * 1. 第三方库加载的方式
	 * 设计方式：redirect进入子包 -> 挂载getApp().$modules -> redirect到原前页
	 * 
	 * 调用方式如： getApp().require('echarts')
	 *
	 * 2. 针对子包的第三方单独打包（配置即可）
	 */
	subpackages: [
		{
			name: 'a-echarts',
			dependencies: [
				'echarts/dist/echarts.min'
			]
		}
	]
};