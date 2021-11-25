/**
 * Mol插件注册相关
 */
import Mol, {
	authorizeManager,
	locationManager,
	sourceManager,
	updateManager,
	queryParser,
	promisify,
	router
} from '@wya/mp-framework';
import { ajax } from '@wya/mp-http';
import { USER_KEY, LOCATION_KEY } from './constants/index';
import API_ROOT from './stores/apis/root';

export default (app) => {
	Mol.use(promisify, wx);
	// 注册小程序更新管理器
	Mol.use(updateManager);

	Mol.use(authorizeManager, {
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
			app.userData = tokenData
		}
	})

	Mol.use(router, wx, {
		beforeEach: async (to, from) => {
			// console.log('beforeEach - to:', to)
			// if (to.path.includes('/a-sub/')) {
			// 	return new Promise((resolve, reject) => {
			// 		setTimeout(() => {
			// 			wx.showModal({
			// 				content: '跳不过去了吧，哈哈'
			// 			});
			// 			resolve(false);
			// 		}, 1000);
			// 	});
			// }
		}
	})
	Mol.use(queryParser, {
		scene2Query: async () => {
			return new Promise(resolve => {
				// 【BUSINESS】模拟接口返回解析结果，具体业务开发时需要替换
				setTimeout(() => {
					resolve({ a: 1, b: 2 });
				}, 2000);
			});
		}
	})

	Mol.use(locationManager, {
		cacheKey: LOCATION_KEY
	})

	Mol.use(sourceManager);
}
