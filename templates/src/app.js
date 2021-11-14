import '@wya/mp-polyfill';
import { Store } from '@wya/mp-store';
import dola from '@wya/mp-framework';
import { storeConfig } from './stores/root';
import mcConfig from './mc.config';
import setup from './setup';
import setupPlugin from './plugin.setup';

// 对整个应用框架进行初始化配置
setup();

dola.app({
	$mc: { config: mcConfig },
	userData: null,
	onLaunch() {
		// dola插件注册
		setupPlugin(this);
		// 注册小程序更新监听
		dola.updateManager.watch();
	},

	async clearLoginAuth() {
		dola.authorizeManager.clearAuthorize();
		let page = getCurrentPages().pop();
		if (!page || page.route === 'pages/auth/index') {
			wx.reLaunch({ url: '`/pages/home/index' });
		}
	},

	store: new Store(storeConfig)
});
