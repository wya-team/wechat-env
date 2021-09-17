import '@wya/mp-polyfill';
import { Store } from '@wya/mp-store';
import { URL } from '@wya/mp-utils';
import { createApp, init } from './framework/index';
import plugins from './app.plugin';

import Enhancer from './utils/enhancer';
import { storeConfig } from './stores/root';
import { config } from './mc.config';

init();

Enhancer.invoke(wx, {
	// 导航页
	tabs: [],
	// 需要授权的页面
	authorizes: []
});
const log = (...rest) => {
	console.log(`%c [App.js]`, 'color: red; font-weight: bold', ...rest);
};


createApp({
	// 小程序初始化时要注册的插件
	plugins,

	$mc: {},
	// 如果项目中不是第三方库子包加载，直接放到这里
	$modules: {},
	userData: null,
	onLaunch() {
		// 注册小程序更新监听
		this.updateManager.watch();
	},
	async onShow() {
		this.$mc.config = config;
	},

	async clearLoginAuth() {
		this.authorizeManager.clearAuthorize();
		let page = getCurrentPages().pop();
		if (!page || page.route === 'pages/auth/index') {
			wx.reLaunch({ url: '`/pages/home/index' });
		}
	},

	/**
	 * 第三方库加载的方式
	 * 设计方式：redirect进入子包 -> 挂载getApp().$modules -> redirect到原前页
	 * 
	 * 调用方式如： getApp().require('echarts')
	 */
	require(pkg, opts = {}) {
		if (this.$modules[pkg]) {
			return this.$modules[pkg]; 
		} else {
			const { path = `/a-${pkg}/pages/load`, replace = true } = opts;
			const { route, options } = getCurrentPages().pop();
			replace && wx.navigateAuto({
				url: URL.merge({
					path,
					query: {
						url: URL.merge({
							path: `/${route}`,
							query: options
						})
					}
				}),
				redirect: true
			});

			return false;
		}
	},

	store: new Store(storeConfig)
});
