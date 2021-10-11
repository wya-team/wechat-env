/**
 * 将wx的某些api方法进行promise化
 * apis: 需要promise化的api
 */
const promiseify = (context, apis = []) => {
	let originalApi;
	apis.forEach((method) => {
		originalApi = context[method];
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
	});
};

export default promiseify;
