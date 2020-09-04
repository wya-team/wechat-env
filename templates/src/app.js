import { Store } from '@wya/mp-store';
import { Storage, URL } from '@wya/mp-utils';

import { HttpHelper, ajax } from '@wya/mp-http';
import API_ROOT from './stores/apis/root';
import Enhancer from './utils/enhancer';
import { storeConfig } from './stores/root';
import { decodeScene, createSchedule } from './utils/utils';
import { USER_KEY } from './constants/constants';
import { config } from './mc.config';

Enhancer.invoke(wx, {
	// 导航页
	tabs: [],
	// 需要授权的页面
	authorizes: []
});
const { log } = console;

App({
	$mc: {},
	userData: null,
	userInfo: {},
	async onShow(options) {
		this.$mc.config = config;
		
		const { query = {} } = wx.getEnterOptionsSync && wx.getEnterOptionsSync() || {};

		this.loginSchedule = createSchedule();

		// 根据用户
		this.userData = Storage.get(USER_KEY);

		if (!this.userData) {
			this.userData = await this._login();
		} else {
			log('LOGIN_ALREADY');
		}

		this.updateUser(this.userData);
	},

	_getQueryParam(query, param) {
		if (query[param]) {
			return query[param];
		} else if (query.scene) {
			return decodeScene(decodeURIComponent(query.scene))[param];
		}
		return null;
	},

	_login() {
		return new Promise((resolve, reject) => {
			wx.login({
				success: async ({ code }) => {
					log('LOGIN_SDK_SUCCESS', code);

					let options = {
						url: API_ROOT._COMMON_AUTH_LOGIN_GET,
						param: {
							code,
							branch: process.env.BRANCH,
						},
						localData: {
							status: 1,
							data: {}
						}
					};

					try {
						let { data = {} } = await ajax(options);
						log('LOGIN_REQUEST_SUCCESS');
						this.updateUser(data);
						resolve(data);
					} catch (e) {
						log('LOGIN_REQUEST_FAIL', e);
						reject(e);

						wx.showModal({ title: e.msg || e.message });
					}
				},
				fail(e) {
					log('LOGIN_SDK_FAIL', e);
					reject(e);

					wx.showModal({ title: e.msg || res.message });
				}
			});
		});
	},

	/**
	 * 更新用户数据资源
	 */
	updateUser(data) {
		this.userData = {
			...this.userData,
			...data
		};

		this.token = this.userData.token;
		this.configData = this.userData.config;

		Storage.set(USER_KEY, this.userData);

		// 需要重新设置config, 或者采用其他方式
		let page = getCurrentPages().pop();
		page && page.setData({
			$config: this.configData
		});

		// 可以重复执行
		this.loginSchedule.complete(this.userData);
	},

	async clearLoginAuth() {
		HttpHelper.cancelAll();
		this.loginSchedule = createSchedule();

		let userData = await this._login();
		this.updateUser(userData);

		// 更新当前页面
		let page = getCurrentPages().pop();
		if (
			!page
			|| page.route === 'pages/auth/index'
		) {
			wx.reLaunch({ url: `/pages/home/index` });
		} else {
			page.onLoad();
			page.onShow();
		}
	},

	store: new Store(storeConfig)
});