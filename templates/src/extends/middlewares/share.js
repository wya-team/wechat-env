/**
 * 分享管理中间件
 * 1、分享功能默认关闭；
 * 2、页面注册options中可指定 share:true 或者 onShareAppMessage 来启用分享功能；
 * https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object
 */

import { URL } from '@wya/mp-utils';

const parseUrl = url => {
	let path;
	let query;
	if (url) {
		const parseResult = URL.parse(url);
		path = parseResult.path.join('/');
		query = parseResult.query;
	} else {
		const { route, options } = getCurrentPages().pop();
		path = `/${route}`;
		query = options;
	}
	return { path, query };
};

export default (next) => userOptions => {
	const { share, onShareAppMessage, ...rest } = userOptions;
	if (share || onShareAppMessage) {
		rest.onShareAppMessage = function (opt) {
			let title = '';
			let imageUrl;
			let path;
			let promise;

			const padPath = url => {
				const parseResult = parseUrl(url);
				return URL.merge({
					path: parseResult.path,
					query: {
						// 【业务】这里可以将全局需要带的参数（如分享人ID等）添加到query中
						...parseResult.query
					}
				});
			};

			if (onShareAppMessage) {
				const userResult = onShareAppMessage.call(this, opt) || {};
				title = userResult.title;
				imageUrl = userResult.imageUrl;
				path = userResult.path;
				promise = userResult.promise;
			}
			
			if (promise) {
				let userPromise = promise;
				promise = new Promise(async resolve => {
					// onShareAppMessage的promise最多可被等待3秒，超出3秒便不会使用promise的返回值
					const timer = setTimeout(() => {
						resolve({
							title,
							path: padPath(path),
							imageUrl,
						});
					}, 3000);
					const promiseResult = await userPromise;
					clearTimeout(timer);
					resolve({
						title: promiseResult.title || title,
						path: padPath(promiseResult.path || path),
						imageUrl: promiseResult.imageUrl || imageUrl,
					});
				});
			}

			return {
				title,
				path: padPath(path),
				imageUrl,
				promise
			};
		};
	}
	return next(rest);
};
