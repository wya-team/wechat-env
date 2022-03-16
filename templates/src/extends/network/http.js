/**
 * 非特殊情况尽量不在该文件里“直接”加业务逻辑，首先应考虑是否可通过 createOptions 中合理扩展配置进行支持
 */

import createHttpClient from '@wya/mp-http';
 
// 接口返回 status 为 -1 时，最大重试次数
const MAX_FAIL_RETRY_COUNT = 10;

let authorizeInstance = null;

const loadingFn = ({ options }) => {
	const { tipMsg } = options || {};
	wx.showLoading({ title: tipMsg || '加载中...', mask: true });
};

const loadedFn = () => {
	// wx.hideLoading();
};

const afterFn = ({ options, response }) => {
	let {
		successTip = true, 
		errorTip = true, 
		errorMsg = response.msg, 
		successMsg = response.msg,
		method
	} = options;

	successTip = successTip && method !== 'GET';
	errorTip = errorTip && !response.code;

	// showLoading与hideLoading必须配对使用，否则会把toast也关掉
	// https://developers.weixin.qq.com/community/develop/doc/000048c46a4260c0f1066197556401
	wx.hideLoading();

	// 可以是promise，不要随便写return
	switch (response.status) {
		case 0:
			errorTip && errorMsg && wx.showToast({ title: errorMsg, duration: 1500, icon: 'none', mask: true });
			break;
		case 1:
			successTip && successMsg && wx.showToast({ title: successMsg, duration: 1500, mask: true });
			break;
		default:
			break;
	}
};

/**
 * 以下“授权”是指是否有请求接口所必须的token类数据
 * createOptions.headers  -> Function  返回附加的请求头信息，可将token等放在这里
 * createOptions.param  -> Function  返回附加的请求参数，支持异步
 * createOptions.isAuthorized  -> Function  判断是否授权
 * createOptions.escapeLoginUrls  -> Array  无需授权的接口
 * createOptions.apis  -> Object  API_ROOT (stores/apis/root.js)
 */
export default createOptions => {
	let ajax;
	const { isAuthorized, escapeLoginUrls = [], onFail } = createOptions;

	const authorize = async () => {
		// 只需要一个授权实例去执行授权逻辑即可
		authorizeInstance = authorizeInstance || createOptions.authorize();
		await authorizeInstance.finally(() => {
			authorizeInstance = null;
		});
	};
	const beforeFn = ({ options }) => {
		return new Promise(async (resolve) => {
			// 接口是需要授权的，且判断当前用户未授权，则需要先执行授权逻辑
			!escapeLoginUrls.includes(options.url) && !isAuthorized() && await authorize();

			const { param: getExtraParams, headers: getExtraHeaders } = createOptions;
			// options优先级更高
			resolve({
				...options,
				param: {
					...(getExtraParams ? await getExtraParams(options) : {}),
					...options.param,
				},
				headers: {
					...(getExtraHeaders ? getExtraHeaders(options) : {}),
					...options.headers
				},
				// 保存业务中传入的原始options，用于重新发起请求
				__options__: options.__options__ || options,
			});
		});
	};

	const otherFn = async (payload) => {
		const { response, options } = payload;
		let failCount = options.__failedCount__ || 0;
		switch (response.status) {
			// 登录信息失效，需要重新授权
			case -1:
				onFail && onFail(payload);
				// 控制最大失败重发次数，防止进入无限循化
				if (failCount < MAX_FAIL_RETRY_COUNT) {
					await authorize();
					// 此处必须要return, 否则重新发起请求后，业务代码内的请求处理结果就不会执行
					return ajax({
						...options.__options__,
						__failedCount__: ++failCount
					});
				}
				break;
			
			default:
				// 其他失败由外部自行处理
				onFail && onFail(payload);
				break;
		}
	};
	
	const http = createHttpClient({
		onLoading: loadingFn,
		onLoaded: loadedFn,
		onOther: otherFn,
		onBefore: beforeFn,
		onAfter: afterFn,
		apis: createOptions.apis,
		debug: process.env.NODE_ENV === 'development'
		// requestType: 'form-data:json'
	});

	// 用于在内部重新发起请求
	ajax = http.ajax;

	return http;
};
 