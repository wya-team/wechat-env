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
			from: resolve(__dirname, './node_modules/@wya/mc', './lib/'),
			to: resolve(__dirname, './dist', './libs/mc')
		}
	]
};