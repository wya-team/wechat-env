import '@wya/mp-polyfill';
import { Store } from '@wya/mp-store';
import { Storage, URL } from '@wya/mp-utils';
import { HttpHelper, ajax } from '@wya/mp-http';
import API_ROOT from './stores/apis/root';
import Enhancer from './utils/enhancer';
import { storeConfig } from './stores/root';
import { decodeScene, createSchedule } from './utils/utils';
import { USER_KEY } from './constants/index';
import { config } from './mc.config';

Enhancer.invoke(wx, {
	// 导航页
	tabs: [],
	// 需要授权的页面
	authorizes: []
});
const log = (...rest) => {
	console.log(`%c [App.js]`, 'color: red; font-weight: bold', ...rest);
};

App({
	$mc: {},
	// 如果项目中不是第三方库子包加载，直接放到这里
	$modules: {},
	userData: null,
	userInfo: {},
	loginScheduleQueue: [],
	async onShow(options) {
		this.$mc.config = config;
		
		const { query = {} } = wx.getEnterOptionsSync && wx.getEnterOptionsSync() || {};

		this.loginSchedule = createSchedule();
		this.loginScheduleQueue.push(this.loginSchedule);

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

		this.loginScheduleQueue.reduceRight((_, loginSchedule) => {
			if (typeof loginSchedule == 'object' && loginSchedule.complete) {
				loginSchedule.complete(this.userData);
			}
			return;
		}, '');
		this.loginScheduleQueue = [];

		// 可以重复执行
		this.loginSchedule.complete(this.userData);
	},

	async clearLoginAuth() {
		HttpHelper.cancelAll();
		this.loginSchedule = createSchedule();
		this.loginScheduleQueue.push(this.loginSchedule);

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
			page.onLoad(page.options);
			page.onShow();
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