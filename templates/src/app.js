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
	store: new Store(storeConfig),

	async beforeShow(options) {
		this.taskWrap((async () => {
			try {
				console.log('beforeShow');
				// this.$query = {};
				this.$query = await Mol.queryParser.parse(options.query);
				console.log('app.$query ->', this.$query);

				// await new Promise((resolve, reject) => {
				// 	setTimeout(reject, 2000);
				// });

				// this.taskWrap(new Promise((resolve, reject) => {
				// 	setTimeout(resolve, 2000);
				// }));

				Mol.authorizeManager.init();
				const userData = Mol.authorizeManager.tokenData;

				// 本地无token信息时
				if (!userData || !userData.token) {
					await this.silentLogin(false);
				} else {
					this.updateUser(userData);
				}
				// return Promise.reject();
			} catch (error) {
				// return Promise.resolve();
				return Promise.reject();
			}
		})());
	},
	onShow() {
		console.log('app.show');
	},

	/**
	 * 静默授权登录（code -> token）
	 * @returns
	 */
	silentLogin(wrap = true) {
		const task = Mol.authorizeManager.codeLogin();
		return wrap ? this.taskWrap(task) : task;
	},

	/**
	 * 更新用户登录信息
	 */
	 updateUser(data) {
		let { config = {} } = this.userData || {};
		const newData = {
			config,
			...data,
		};

		Mol.authorizeManager.setTokenData(newData);
		this.onUserDataChange(newData);
	},

	onUserDataChange(data) {
		this.userData = data;

		if (!data) return;

		// 通过provider更新页面及组件内使用的config（移步./extends/mixins/injector.js)
		Mol.provider.set({ userData: data });
	},


	async clearLoginAuth() {
		Mol.authorizeManager.clearAuthorize();
		// let page = getCurrentPages().pop();
		// if (!page || page.route === '/a-account/pages/login/channel') {
		// 	this.reLaunchHome();
		// }
	},

	taskWrap(task) {
		Mol.addPreprocessingTask(task);
		return task;
	}
});
