import '@wya/mp-polyfill';
import { Store } from '@wya/mp-store';
import Mol from '@wya/mol';
import { storeConfig } from './stores/root';
import mcConfig from './mc.config';
import setup from './setup';
import setupPlugin from './plugin.setup';

// 对整个应用框架进行初始化配置
setup();

Mol.app({
	$mc: { config: mcConfig },
	userData: null,
	onLaunch() {
		// Mol插件注册
		setupPlugin(this);
		// 注册小程序更新监听
		Mol.updateManager.watch();
	},

	async clearLoginAuth() {
		Mol.authorizeManager.clearAuthorize();
		let page = getCurrentPages().pop();
		if (!page || page.route === 'pages/auth/index') {
			wx.reLaunch({ url: '`/pages/home/index' });
		}
	},

	require(...args) {
		return Mol.sourceManager.require(...args);
	},
	
	store: new Store(storeConfig)
});
