const { expect } = require('chai');

const { HttpError, default: createHttpClient } = require('..');
const { ERROR_CODE } = require('../core/HttpError');

global.wx = {
	request(options = {}) {
		const { url, data, header, method, success, fail } = options;
		success({
			login: "wya-team"
		});
	}
};

describe('browser.js', () => {
	let $ = createHttpClient({
		onAfter: (res) => {
			expect(typeof res).to.equal('object');
			// console.log(res);
		},
		onBefore: (res) => {
			expect(typeof res).to.equal('object');
			// console.log(res);
		}
	});
	expect(typeof $.ajax).to.equal('function');

	it('无URL验证错误', async () => {
		try {
			let res = await $.ajax();
		} catch (e) {
			expect(e.code).to.equal(ERROR_CODE.HTTP_URL_EMPTY);
		}
	});
	
	it('localData验证: status = 1', async () => {
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
			expect(res.data.user).to.equal('wya');
		} catch (res) {
			throw new Error(res);
		}
	});

	it('localData验证: status = 0', async () => {
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
			expect(res.data.user).to.equal('wya');
		}
	});

	it('localData验证: status = null', async () => {
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
			expect(res.data.user).to.equal('wya');
		}
	});

	
	it('server验证: status = 1', async () => {
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
			expect(res.data.login).to.equal('wya-team');
		} catch (res) {
			throw new Error(res);
		}
	});

	
	it('server验证: status = 0', async () => {
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
			};

			let res = await $.ajax(options);
		} catch (res) {
			expect(res.status).to.equal(0);
			expect(res.code).to.equal(ERROR_CODE.HTTP_FORCE_DESTROY);
		}
	});

	
	it('server验证: onOther', async () => {
		try {
			let options = {
				url: 'https://api.github.com/users/wya-team',
				credentials: 'omit', // cors下关闭
				onOther: ({ response, options, resolve, reject }) => {
					expect(response.login).to.equal('wya-team');
				}
			};

			let res = await $.ajax(options);
		} catch (res) {
			expect(res.code).to.equal(ERROR_CODE.HTTP_FORCE_DESTROY);
		}
	});

	
	it('server验证: onOther 错误捕获', async () => {
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
			expect(res.code).to.equal(ERROR_CODE.HTTP_CODE_ILLEGAL);
			expect(res.exception.message).to.equal('程序内部执行错误');
		}
	});

	it('server验证: onLoading 错误捕获', async () => {
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
			expect(res.code).to.equal(ERROR_CODE.HTTP_FORCE_DESTROY);
		} finally {
			expect(count).to.equal(2);
		}
	});
});
