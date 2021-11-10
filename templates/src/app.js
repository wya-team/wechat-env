import '@wya/mp-polyfill';
import { Store } from '@wya/mp-store';
import { URL } from '@wya/mp-utils';
import dola from '@wya/mp-framework';
import { storeConfig } from './stores/root';
import { config } from './mc.config';
import setup from './setup';

// 对整个应用框架进行初始化配置
setup();

dola.app({

	$mc: {},
	// 如果项目中不是第三方库子包加载，直接放到这里
	$modules: {},
	userData: null,
	onLaunch() {
		// 注册小程序更新监听
		dola.updateManager.watch();
	},
	async onShow() {
		this.$mc.config = config;
	},

	async clearLoginAuth() {
		dola.authorizeManager.clearAuthorize();
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
			replace && wx.redirectTo({
				url: URL.merge({
					path,
					query: {
						url: URL.merge({
							path: `/${route}`,
							query: options
						})
					}
				}),
			});

			return false;
		}
	},

	store: new Store(storeConfig)
});
