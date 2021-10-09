
const createApp = createOptions => {
	const { helpers, ...options } = createOptions;
	const { onLaunch, onShow } = options;
	Object.assign(options, {
		onLaunch(opts) {
			// helpers注册，注意：此处helper注册时机均为小程序初始化时，如按需注册时可通过 app.useHelper 在对应时机注册
			if (helpers && helpers.length) {
				helpers.forEach(helper => {
					this.useHelper(helper.entry, helper.options);
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
		 * 注册helper（如单独抽离的某些辅助逻辑、工具）
		 * @param {*} helper helper对象，需提供 install 方法用于注册
		 */
		useHelper(helper, opts) {
			const install = helper.install;
			if (typeof install === 'function') {
				install(this, opts);
			} else {
				throw new Error("helper's install method is requird.");
			}
		}
	});

	App(options);
};

export default createApp;