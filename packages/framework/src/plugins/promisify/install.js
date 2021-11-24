import { PROMISIFY_APIS } from './constants';

// 已经promisify过的api
const __promisifiedApis = [];

/**
 * 将wx的某些api方法进行promise化
 * apis: 需要promise化的api
 */
const promisify = (context, apis = []) => {
	let originalApi;
	apis.forEach((method) => {
		if (__promisifiedApis.includes(method)) return;
		originalApi = context[method];
		if (typeof originalApi !== 'function') return;
		Object.defineProperty(context, method, {
			value: (...args) => {
				if (!args[0] || (args[0] && typeof args[0] === 'object')) {
					let options = args[0] || {};

					if (options.success || options.fail || options.complete) {
						originalApi(options);
					} else {
						return new Promise((resolve, reject) => {
							originalApi.call(context, {
								...options,
								success: resolve,
								fail: reject
							});
						});
					}
				}
			}
		});
		__promisifiedApis.push(method);
	});
};

export default (mol, ctx, extraApis = []) => {
	promisify(ctx, [...PROMISIFY_APIS, ...extraApis]);
	mol.promisify = promisify;
};
