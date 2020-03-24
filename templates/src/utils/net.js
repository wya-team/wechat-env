/**
 * ajax
 * @param  {[type]} url     地址
 * @param  {[type]} method  请求类型
 * @param  {[type]} body    请求的参数
 * @param  {Object} options 扩展
 */

import createHttpClient from '@wya/mp-http';
import { Storage } from '@wya/mp-utils';
import API_ROOT from '../stores/apis/root';

const loadingFn = ({ options }) => {
	const { tipMsg } = options || {};
	wx.showLoading({ title: tipMsg || '加载中...', mask: true });
};
const loadedFn = () => {
	// wx.hideLoading();
};

const otherFn = ({ response }) => {
	switch (response.status) {
		case -1:
			
			break;
		default:
			break;
	}
};

const beforeFn = ({ options }) => {
	// let token = JSON.stringify(Storage.get(TOKEN_KEY) || options.headers.token);
	let token = {};
	return new Promise(async (resolve, reject) => {
		// options优先级更高
		resolve({
			...options,
			param: {
				...options.param,
			},
			headers: {
				...options.headers,
				token,
			}
		});
	});
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

	if (response.extra) {
		const app = getApp();
		const { info, link } = response.extra || {};
		info && app.reset({ info });
		link && app.reset({ link });
	}

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

const globalOptions = {
	onLoading: loadingFn,
	onLoaded: loadedFn,
	onOther: otherFn,
	onBefore: beforeFn,
	onAfter: afterFn,
	apis: API_ROOT,
	debug: process.env.NODE_ENV === 'development'
	// requestType: 'form-data:json'
};

export default createHttpClient(globalOptions);
