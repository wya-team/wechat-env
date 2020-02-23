import HttpError, { ERROR_CODE } from './HttpError';
import { getPropByPath } from '../utils/index';

class HttpAdapter {
	static http = (opts = {}) => {
		const {
			debug,
			credentials,
			getInstance
		} = opts;
		let { url, headers, body, method } = HttpAdapter.getOptions(opts);

		let tag = `${opts.url}: ${new Date().getTime()}`;

		debug && console.time(`[@wya/http]: ${tag}`);

		return new Promise((resolve, reject) => {
			// 用于取消
			getInstance && getInstance({
				cancel: HttpAdapter.cancel.bind(null, { options: opts, reject }), 
			});	

			/**
			 * bug fix
			 * iOS 10 fetch() 没有finally方法
			 * 使用@babel/polyfill修复Promise，无法修复fetch，可以是fetch内部实现了一套Promise
			 */
			let finallyHack = () => {
				debug && console.timeEnd(`[@wya/http]: ${tag}`);
			};
			
			wx.request({
				url,
				data: body,
				header: headers,
				method,
				success: (responseText) => {
					resolve(responseText);
					
					finallyHack();
				},
				fail: (res) => {
					reject(new HttpError({
						code: ERROR_CODE.HTTP_STATUS_ERROR,
						httpStatus: res.status,
					}));
					finallyHack();
				}
			});
		});
	}
	
	static cancel({ xhr, options, reject }) {
		options.setOver && options.setOver(new HttpError({
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

			// headers['Content-Type'] = 'multipart/form-data';
			headers['Content-Type'] = null; // 自动生成代码片段, 携带boundary=[hash], 否则后端无法接受
			method = 'POST';

			let formData = new FormData();

			// 参数
			if (param) {
				Object.keys(param).forEach(key => {
					let fileName = undefined;  // eslint-disable-line
					if (param[key] instanceof Blob) { // File or Blob
						fileName = param[key].name || fileName;
					}
					fileName 
						? formData.append(key, param[key], fileName)
						: formData.append(key, param[key]); // 特殊处理
				});
			}
			body = formData;
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
			body
		};
	};
}

export default HttpAdapter;
