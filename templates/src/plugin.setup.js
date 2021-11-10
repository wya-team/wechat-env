/**
 * dola插件注册相关
 */
import dola, { router, promisify } from '@wya/mp-framework';
import { ajax } from '@wya/mp-http';
import { updateManager, queryParser, authorizeManager } from './extends/index';
import { USER_KEY } from './constants/index';
import API_ROOT from './stores/apis/root';

export default () => {
	dola.use(promisify, wx);
	// 注册小程序更新管理器
	dola.use(updateManager);

	dola.use(authorizeManager, {
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
		}
	})

	dola.use(router, wx, {
		beforeEach: async (to, from) => {
			console.log('beforeEach - to:', to)
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
	dola.use(queryParser, {
		scene2Query: async () => {
			return new Promise(resolve => {
				// 模拟接口返回解析结果，具体业务开发时需要替换
				setTimeout(() => {
					resolve({ a: 1, b: 2 });
				}, 2000);
			});
		}
	})
	
}
