import '@wya/mp-polyfill';
import { Store } from '@wya/mp-store';
import Mol from '@wya/mol';
import { storeConfig } from './stores/root';
import mcConfig from './mc.config';
import setup from './setup';

// 对整个应用框架进行初始化配置
setup();

Mol.app({
	$mc: { config: mcConfig },
	userData: null,
	onLaunch() {
		console.log('-----App onLaunch');
	},

	beforeShow(...args) {
		console.log(...args, '-----App onBeforeShow');
	},
	onShow() {
		console.log('-------App onShow');
	},
	

	async clearLoginAuth() {
		Mol.authorizeManager.clearAuthorize();
		let page = getCurrentPages().pop();
		if (!page || page.route === 'pages/auth/index') {
			this.$router.reLaunch({ url: '`/pages/home/index' });
		}
	},

	require(...args) {
		return Mol.sourceManager.require(...args);
	},
	
	store: new Store(storeConfig)
});
