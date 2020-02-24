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
};
const loadedFn = () => {
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
	// return {
	// 	...options,
	// 	headers: {
	// 		...options.headers,
	// 		token: JSON.stringify(Storage.get(TOKEN_KEY))
	// 	}
	// };
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

	// 可以是promise，不要随便写return
	switch (response.status) {
		case 0:
			errorTip && errorMsg && console.error(errorMsg);
			break;
		case 1:
			successTip && successMsg && console.info(successMsg);
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
	debug: false
	// requestType: 'form-data:json'
};

export default createHttpClient(globalOptions);
