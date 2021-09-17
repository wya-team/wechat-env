
const createApp = createOptions => {

	const { plugins, ...options } = createOptions;
	const { onLaunch, onShow } = options;
	Object.assign(options, {
		onLaunch(opts) {
			// 插件注册，注意：此处插件注册时机均为小程序初始化时，如按需注册时可通过 app.usePlugin 在对应时机注册
			if (plugins && plugins.length) {
				plugins.forEach(plugin => {
					this.usePlugin(plugin.entry, plugin.options);
				});
			}
			onLaunch && onLaunch.call(this, opts);
		},

		async onShow(opts) {
			this.$enterOptions = opts;
			if (this.queryParser) {
				this.$enterOptions.query = await this.queryParser(opts.query);
			}
			onShow && onShow.call(this, opts);
		},

		/**
		 * 注册插件（如单独抽离的某些辅助逻辑、工具）
		 * @param {*} plugin 插件对象，需提供 install 方法
		 */
		usePlugin(plugin, opts) {
			const install = plugin.install;
			if (typeof install === 'function') {
				install(this, opts);
			} else {
				throw new Error("plugin's install method is requird.");
			}
		}
	});

	App(options);
};

export default createApp;