import Mol, { setup } from '@wya/mol';
import Router from '@wya/mol-plugin-router';
import storeMiddleware from '@wya/mp-store';
import authorizeManager from '@wya/mol-plugin-authorize';
import locationManager from '@wya/mol-plugin-location';
import updateManager from '@wya/mol-plugin-update';
import promisify from '@wya/mol-plugin-promisify';
import queryParser from '@wya/mol-plugin-query';
import sourceManager from '@wya/mol-plugin-source';
import { ajax } from '@wya/mp-http';
import API_ROOT from './stores/apis/root';
import { USER_KEY, LOCATION_KEY } from './constants/index';
import {
	shareMiddleware,
	setupGlobalMixin
} from './extends/index';
import { onBeforeEach } from './router/index';

const router = new Router({
	// 如需要在跳转时支持：跳转 tab 页面时自动使用 switchTab，
	// 则可在此配置 tab 页面的路径，如 '/pages/home/index'
	tabPages: [

	]
});

router.beforeEach(onBeforeEach);

setupGlobalMixin(Mol);

export default () => {
	setup({
		router,
		// 页面setup配置
		page: {
			/**
			 * 注意：
			 * 中间件注册顺序为从前往后，但实际代理的方法的执行顺序是从后往前的
			 * 示例：middlewares: [A, B]，A、B均对onLoad进行代理，
			 * 则注册顺序：先注册 A，再注册 B，
			 * onLoad执行顺序：先执行 B 代理过的onLoad，再执行 A 代理过的 onLoad
			 */
			middlewares: [
				// 用于页面的中间件
				shareMiddleware,
				storeMiddleware
			]
		},
		// 组件setup配置
		component: {
			middlewares: [
				// 用于组件的中间件
				storeMiddleware
			]
		},
		provider() {
			return {
				config: {
					configA: 'a',
					configB: 'b',
					configC: 'c',
					configD: {
						d: 'd'
					},
					configE: [
						{ e: 'eee' },
						['1234']
					]
				}
			};
		},
		plugins: [
			Router,
			[
				authorizeManager,
				{
					cacheKey: USER_KEY,
					code2Token: code => {
						return new Promise(async (resolve, reject) => {
							try {
								const res = await ajax({
									url: API_ROOT._COMMON_AUTH_LOGIN_GET,
									param: {
										code,
										branch: process.env.BRANCH,
									},
									localData: {
										status: 1,
										// 模拟数据
										data: { token: '1' }
									}
								});
								resolve(res.data);
							} catch (error) {
								reject(error);
							}
						});
					},
					onTokenChange: (tokenData) => {
						getApp().userData = tokenData;
					}
				}
			],
			[
				queryParser,
				{
					scene2Query: async () => {
						return new Promise((resolve, reject) => {
							// 【BUSINESS】模拟接口返回解析结果，具体业务开发时需要替换
							setTimeout(() => {
								resolve({ a: 1, b: 2 });
							}, 2000);
						});
					}
				}
			],
			[
				locationManager,
				{
					cacheKey: LOCATION_KEY
				}
			],
			// 小程序更新管理器
			updateManager,
			sourceManager,
			[
				promisify,
				wx
			]
		]
	});
};
