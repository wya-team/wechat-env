import { Storage } from '@wya/mp-utils';
import { HttpHelper } from '@wya/mp-http';
import { logger } from '../utils/index';

const log = (...rest) => logger('AuthorizeManager', ...rest);

class AuthorizeManager {
	constructor(context, options) {
		this.context = context;
		this.cacheKey = options.cacheKey;
		this.code2Token = options.code2Token;
	}

	init() {
		this.getCachedTokenData();
	}
	
	/**
	 * 微信code换取token
	 */
	async codeLogin() {
		try {
			const { code } = await this.wxLogin();
			// 通过code向服务端换取userData（包括token）
			const data = await this.code2Token(code);
			this.setTokenData(data);
		} catch (error) {
			log(error);
		}
	}

	/**
	 * wx.login promiseify
	 * @returns wx.login 返回结果
	 */
	wxLogin() {
		return new Promise((resolve, reject) => {
			wx.login({
				success: resolve,
				fail(error) {
					reject(error);
					wx.showModal({ content: error.msg || error.message });
				}
			});
		});
	}

	getCachedTokenData() {
		const data = Storage.get(this.cacheKey);
		this.context.userData = data || {};
		return data;
	}

	setTokenData(data) {
		this.context.userData = data;
		Storage.set(this.cacheKey, data);
	}
	
	/**
	 * 清除授权
	 */
	clearAuthorize() {
		HttpHelper.cancelAll();
		this.context.userData = {};
		Storage.remove(this.cacheKey);
	}
}

export default {
	install(context, opts = {}) {
		context.authorizeManager = new AuthorizeManager(context, opts);
	}
};