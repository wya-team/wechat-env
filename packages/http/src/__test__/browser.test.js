import createHttpClient from '..';
import { ERROR_CODE } from '../core/HttpError';

describe('browser.js', () => {
	let $ = createHttpClient({
		onAfter: (res) => {
			expect(typeof res).toBe('object');
			console.log(res);
		},
		onBefore: (res) => {
			expect(typeof res).toBe('object');
			console.log(res);
		}
	});
	expect(typeof $.ajax).toBe('function');

	test('无URL验证错误', async () => {
		try {
			let res = await $.ajax();
		} catch (e) {
			expect(e.code).toBe(ERROR_CODE.HTTP_URL_EMPTY);
		}
	});

	test('localData验证: status = 1', async () => {
		try {
			let options = {
				localData: {
					status: 1,
					data: {
						user: 'wya'
					}
				}
			};
			let res = await $.ajax(options);
			expect(res.data.user).toBe('wya');
		} catch (res) {
			throw new Error(res);
		}
	});

	test('localData验证: status = 0', async () => {
		try {
			let options = {
				localData: {
					status: 0,
					data: {
						user: 'wya'
					}
				}
			};
			await $.ajax(options);
		} catch (res) {
			expect(res.data.user).toBe('wya');
		}
	});

	test('localData验证: status = null', async () => {
		try {
			let options = {
				localData: {
					status: null,
					data: {
						user: 'wya'
					}
				}
			};
			await $.ajax(options);
		} catch (res) {
			expect(res.data.user).toBe('wya');
		}
	});

	// 设置20秒超时
	jest.setTimeout(20000); 
	test('server验证: status = 1', async () => {
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
				onAfter: ({ response }) => {
					return {
						status: 1,
						data: {
							...response
						}
					};
				}
			};

			let res = await $.ajax(options);
			expect(res.data.login).toBe('wya-team');
		} catch (res) {
			throw new Error(res);
		}
	});

	// 设置20秒超时
	jest.setTimeout(20000); 
	test('server验证: status = 0', async () => {
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
			};

			let res = await $.ajax(options);
		} catch (res) {
			expect(res.status).toBe(0);
			expect(res.code).toBe(ERROR_CODE.HTTP_FORCE_DESTROY);
		}
	});

	// 设置20秒超时
	jest.setTimeout(20000); 
	test('server验证: onOther', async () => {
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
				onOther: ({ response, options, resolve, reject }) => {
					expect(response.login).toBe('wya-team');
				}
			};

			let res = await $.ajax(options);
		} catch (res) {
			expect(res.code).toBe(ERROR_CODE.HTTP_FORCE_DESTROY);
		}
	});

	// 设置20秒超时
	jest.setTimeout(20000); 
	test('server验证: onOther 错误捕获', async () => {
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
				debug: false,
				onOther: ({ response, options, resolve, reject }) => {
					throw new Error('程序内部执行错误'); // 被catch捕获
				}
			};

			let res = await $.ajax(options);
		} catch (res) {
			expect(res.code).toBe(ERROR_CODE.HTTP_CODE_ILLEGAL);
			expect(res.exception.message).toBe('程序内部执行错误');
		}
	});

	jest.setTimeout(20000); 
	test('server验证: onLoading 错误捕获', async () => {
		let count = 0;
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
				debug: false,
				onLoading: () => {
					count++;
				},
				onLoaded: () => {
					count++;
				}
			};

			let res = await $.ajax(options);
		} catch (res) {
			expect(res.code).toBe(ERROR_CODE.HTTP_FORCE_DESTROY);
		} finally {
			expect(count).toBe(2);
		}
	});
});
