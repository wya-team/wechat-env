import HttpError, { ERROR_CODE } from './HttpError';
import HttpHelper from './HttpHelper';
import { getPropByPath } from '../utils/index';

class HttpAdapter {
	static http = (opts = {}) => {
		const {
			debug,
			credentials,
			getInstance
		} = opts;
		let { url, headers, body, method, file } = HttpAdapter.getOptions(opts);

		let tag = `${opts.url}: ${new Date().getTime()}`;

		debug && console.time(`[@wya/http]: ${tag}`);

		return new Promise((resolve, reject) => {
			/**
			 * https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
			 * 目前是这些需
			 */
			let ajax;
			let request;
			let cancel; 
			let requestOptions = {};
			let commonOptions = {
				url,
				header: headers,
				success: (res) => {
					resolve(res.data);
				},
				fail: (res) => {
					reject(new HttpError({
						options: opts,
						code: ERROR_CODE.HTTP_STATUS_ERROR,
						httpStatus: res.statusCode,
						msg: res.errMsg
					}));
				},
				complete: () => {
					HttpHelper.remove(request);
					debug && console.timeEnd(`[@wya/http]: ${tag}`);
				}
			};

			if (opts.method === 'FORM') {
				ajax = wx.uploadFile;
				requestOptions = {
					formData: body,
					...file
				};
			} else {
				ajax = wx.request;
				requestOptions = {
					data: body,
					method,
				};
			}

			request = ajax({ ...commonOptions, ...requestOptions });
			cancel = HttpAdapter.cancel.bind(null, { options: opts, reject, request });

			let params = { cancel, request, options: opts };
			// 用于取消
			getInstance && getInstance(params);	
			HttpHelper.add(params);
		});
	}
	
	static cancel({ request, options, reject }) {
		request && request.abort && request.abort();

		options.setOver && options.setOver(new HttpError({
			options,
			code: ERROR_CODE.HTTP_CANCEL
		}));
	}
	
	static getOptions = (options) => {
		let { param, allowEmptyString, url, requestType } = options;

		let isJson = requestType === 'json';
		let isFormDataJson = requestType === 'form-data:json';

		/**
		 * /repo/{books_id}/{article_id} 解析RESTFUL URL 或者动 态的;
		 * TODO: 是否考虑一下情况 -> /repo{/books_id}{/article_id}
		 */
		let dynamic = /\{([\s\S]{1,}?(\}?)+)\}/g;
		if (dynamic.test(url)) {
			let delTmp = [];
			url = url.replace(dynamic, key => {
				let k = key.replace(/(\{|\}|\s)/g, '');
				delTmp.push(k);
				return getPropByPath(param, k).value || key;
			});

			delTmp.forEach(i => param[i] && delete param[i]);
		}
		

		let paramArray = [];
		let paramString = '';
		for (let key in param) {
			/**
			 * 过滤掉值为null, undefined, ''情况
			 */
			if (param[key] || param[key] === false || param[key] === 0 || (allowEmptyString && param[key] === '')) {
				paramArray.push(key + '=' + encodeURIComponent(param[key]));
			}
		}

		if (/(JSONP|GET|DELETE)$/.test(options.method) && paramArray.length > 0) {
			url += (url.indexOf('?') > -1 ? '&' : '?') + paramArray.join('&');
		}

		let headers = {
			'Accept': '*/*',
			'X-Requested-With': 'XMLHttpRequest'
		};
		let method = options.method;

		let body = undefined; // eslint-disable-line
		let file = undefined; // eslint-disable-line

		// 主动添加Header
		if ((/(PUT|POST|DELETE)$/.test(options.method))) { // PUT + POST + DELETE
			headers['Content-Type'] = isJson
				? `application/json;charset=utf-8` 
				: `application/x-www-form-urlencoded`;
			if (isJson) {
				body = typeof options.param === 'object'
					? JSON.stringify(param)
					: undefined;
			} else {
				body = isFormDataJson
					? `data=${encodeURIComponent(JSON.stringify(param))}` // 业务需要
					: paramArray.join('&');
			}
		} else if (options.method === 'FORM') {
			body = {};
			headers['Content-Type'] = null;
			method = 'POST';

			// 参数
			if (param) {
				Object.keys(param).forEach(key => {
					// iOS: wxfile://tmp_xx[.ext]
					if (/[a-zA-z]+:\/\/tmp[^\s]*/.test(param[key])) { 
						file = {
							name: key,
							filePath: param[key]
						};
					} else {
						body[key] = param[key];
					}
				});
			}
		}

		headers = { ...headers, ...options.headers };

		/**
		 * 清理headers
		 */
		for (const h in headers) {
			if (headers.hasOwnProperty(h) && !headers[h]) { // eslint-disable-line
				delete headers[h];
			}
		}

		return {
			url,
			method,
			headers,
			body,
			file
		};
	};
}

export default HttpAdapter;
