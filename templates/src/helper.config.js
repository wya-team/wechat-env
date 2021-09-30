/**
 * 该文件为 app 的helper
 */

import { ajax } from '@wya/mp-http';
import { updateManager, queryParser, authorizeManager } from './helpers/index';
import { USER_KEY } from './constants/index';
import API_ROOT from './stores/apis/root';

export default [
	{ entry: updateManager },
	{
		entry: queryParser,
		options: {
			scene2Query: async () => {
				return new Promise(resolve => {
					// 模拟接口返回解析结果，具体业务开发时需要替换
					setTimeout(() => {
						resolve({ a: 1, b: 2 });
					}, 1000);
				});
			}
		}
	},
	{
		entry: authorizeManager,
		options: {
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
		}
	}
];