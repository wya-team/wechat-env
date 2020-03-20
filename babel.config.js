module.exports = (api) => {
	// 编译缓存
	api && api.cache.forever();
	
	return {
		presets: ['@babel/preset-env'],
		plugins: [
			[
				"@babel/plugin-proposal-class-properties",
				{
					"loose": true
				}
			],
			"@babel/plugin-transform-runtime"

		]
	};
};