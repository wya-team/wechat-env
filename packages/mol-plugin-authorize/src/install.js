import { Storage } from '@wya/mp-utils';
import { HttpHelper } from '@wya/mp-http';

class AuthorizeManager {
	constructor(options) {
		this.tokenData = null;
		this.cacheKey = options.cacheKey;
		this.code2Token = options.code2Token;
		this.onTokenChange = options.onTokenChange;

		this.init();
	}

	init() {
		this.getTokenFromCache();
	}
	
	/**
	 * 微信code换取token
	 */
	async codeLogin() {
		const { code } = await this.wxLogin();
		// 通过code向服务端换取tokenData
		const data = await this.code2Token(code);
		this.setTokenData(data);
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
					const msg = error.msg || error.message;
					msg && wx.showModal({ content: msg });
				}
			});
		});
	}

	getTokenFromCache() {
		const data = Storage.get(this.cacheKey);
		this.updateToken(data);
		return data;
	}

	setTokenData(data) {
		this.updateToken(data);
		Storage.set(this.cacheKey, data);
	}

	updateToken(tokenData) {
		this.tokenData = tokenData;
		this.onTokenChange(tokenData);
	}
	
	/**
	 * 清除授权
	 */
	clearAuthorize() {
		HttpHelper.cancelAll();
		this.updateToken(null);
		Storage.remove(this.cacheKey);
	}
}

const install = (Mol, opts = {}) => {
	Mol.authorizeManager = new AuthorizeManager(opts);
};

export default install;