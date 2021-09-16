import HttpError, { ERROR_CODE } from './HttpError';
import HttpAdapter from './HttpAdapter';
import defaultOptions from './defalutOptions';
import { compose, noop } from '../utils';

class HttpShell {
	constructor(registerOptions = {}) {
		const { 
			apis, 
			baseUrl,
			http,
			onBefore,
			onAfter,
			...globalOptions 
		} = registerOptions;

		this.apis = apis || {};

		// 默认fetch
		this.http = http || HttpAdapter.http;

		this.onBefore = onBefore || noop;
		this.onAfter = onAfter || noop;

		// 与全局配置, 重新生成默认配置
		this.defaultOptions = {
			...defaultOptions,
			...globalOptions
		};

		const allowMethod = ['get', 'post', 'put', 'delete', 'option', 'form'];

		allowMethod.forEach(i => {
			this[i] = (opts = {}) => {
				return this.ajax({ ...opts, type: i.toUpperCase() });
			};
		});
	}

	ajax(userOptions = {}) {
		let options = { ...this.defaultOptions, ...userOptions };

		return this._sendRequest(options)
			.catch((e) => {
				options.debug && HttpError.output(e);
				return Promise.reject(e);
			});
	}

	async _sendRequest(opts) {

		this._beforeRequest(opts);

		// 超时或者取消请求（会有数据，但不操作)
		let setOver = null;
		try {
			opts = await this._getRequestOptions(opts);
			const request = this._getApiPromise(opts);

			const cancel = new Promise((_, reject) => {
				setOver = e => {
					delete opts.setOver;
					this._beforeOver(opts);
					reject(e);
				};
			});

			opts.setOver = setOver;

			if (opts.method === 'FORM') {
				return Promise.race([request, cancel]);
			} else {
				return Promise.race([
					request,
					cancel,
					new Promise((_, reject) => {
						setTimeout(() => {
							// TODO: 超时依然走catch 或者 不执行任何操作(delete opts.setOver); 
							this._beforeOver(opts);
							reject(new HttpError({
								code: ERROR_CODE.HTTP_REQUEST_TIMEOUT,
							}));
						}, opts.timeout * 1000);
					})
				]);
			}
		} catch (e) {
			setOver && setOver();
			// 强制.catch
			throw new HttpError({ code: ERROR_CODE.HTTP_CODE_ILLEGAL, exception: e });
		}
	}

	_beforeRequest(opts = {}) {
		const { localData, loading, onLoading } = opts;

		if (!localData && loading) {
			onLoading({ options: opts });
		}
	}

	_beforeOver(opts = {}) {
		const { localData, loading, onLoaded } = opts;

		if (!localData && loading) {
			onLoaded({ options: opts });
		}
	}

	async _getRequestOptions(opts = {}) {
		try {
			const { onBefore } = opts;

			// before，全局的方法先执行，注册的方法后执行（确保可以拿到构造好的参数）
			try {
				opts = await this.onBefore({ options: opts }) || opts;
				opts = await onBefore({ options: opts }) || opts;
			} catch (e) {
				throw new HttpError({ 
					code: ERROR_CODE.HTTP_OPTIONS_BUILD_FAILED, 
					exception: e 
				});
			}

			let { url, param, type, localData, requestType, restful } = opts;

			if (!/[a-zA-z]+:\/\/[^\s]*/.test(url)) {
				let combo = url.split('?'); // 避免before带上?token=*之类
				url = `${this.apis[combo[0]] || ''}${combo[1] ? `?${combo[1]}` : ''}`;
			}

			if (!url && !localData) {
				throw new HttpError({ 
					code: ERROR_CODE.HTTP_URL_EMPTY, 
				});
			}
			let method = type.toUpperCase();

			return {
				...opts,
				url,
				method
			};
		} catch (e) {
			// 强制.catch
			throw new HttpError({ code: ERROR_CODE.HTTP_CODE_ILLEGAL, exception: e });
		}
	}

	_getApiPromise(opts = {}) {
		const { localData, delay } = opts;

		return new Promise((onSuccess, onError) => {
			let temp; // 通常用于请求返回的参数解析不是json时用（结合onAfter强制status: 1）
			let target = localData 
				? Promise.resolve(localData) 
				: this.http(opts);

			let done = next => res => {
				this._beforeOver(opts);
				next(res);
			};

			let delayDone = next => res => {
				typeof delay === 'number' 
					? setTimeout(() => next(res), delay * 1000)
					: next(res);
			};

			let resolve = compose(delayDone, done)(onSuccess);
			let reject = compose(delayDone, done)(onError);

			// 不使用async/await 直观一些
			target
				.then((response) => {
					temp = response;
					return response = typeof response === 'object' 
						? response
						: JSON.parse(response);
				})
				.catch((e) => {
					return new HttpError({
						code: ERROR_CODE.HTTP_RESPONSE_PARSING_FAILED,
						exception: e,
						data: temp
					});
				})
				.then((response) => {
					temp = null;
					// 重新构成结果
					return this._disposeResponse({
						options: opts, 
						response, 
						resolve, 
						reject
					});
				})
				.catch(e => {
					reject(e);
				});
		});
	}

	async _disposeResponse(opts = {}) {
		try {
			let { options, response, resolve, reject } = opts;
			
			// 已经取消
			if (!options.localData && !options.setOver) return;

			let { onOther, onAfter } = options;

			// after，注册的方法先执行，全局的方法后执行（确保可以拿到改造好的参数）
			try {
				response = await onAfter({ response, options }) || response;
				response = await this.onAfter({ response, options }) || response;
			} catch (e) {
				throw new HttpError({
					code: ERROR_CODE.HTTP_RESPONSE_REBUILD_FAILED,
					exception: e,
				});
			}

			// 正常业务流程
			switch (response.status) {
				case 1:
				case true:
					resolve(response);
					return;
				case 0:
				case false:
					reject(response);
					return;
				default:
					let other = onOther && onOther({ response, resolve, reject, options }); // eslint-disable-line
					if (!other || typeof other !== 'object' || !other.then) {
						let error = {
							...new HttpError({
								code: ERROR_CODE.HTTP_FORCE_DESTROY,
							}),
							...response
						};
						// 强制释放内存
						reject(error);
					} else {
						try {
							// 用户自行处理res的值
							let res = await other;
							(res && typeof res === 'object' && (res.status === 1 || res.status === true))
								? resolve(res)
								: reject(res);
						} catch (error) {
							reject(error);
						}
					}
			}
		} catch (e) {
			throw new HttpError({ code: ERROR_CODE.HTTP_CODE_ILLEGAL, exception: e });
		}
	}
}

export default HttpShell;