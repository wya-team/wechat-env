import { Storage } from '@wya/mp-utils';
import { HttpHelper } from '@wya/mp-http';

// 缓存wxLogin的promise实例，避免重复发起
let _wxLoginInstance;

class AuthorizeManager {
	constructor(options) {
		this._tokenData = null;
		this.cacheKey = options.cacheKey;
		this.code2Token = options.code2Token;
		this.onTokenChange = options.onTokenChange;

		// 缓存codeLogin的promise实例，避免重复发起（因为涉及到外部传入的code2Token，所以挂在AuthorizeManager的实例上）
		this._codeLoginInstance = null;

		// this.init();
	}

	get tokenData() {
		return this._tokenData;
	}

	set tokenData(value) {
		this.setTokenData(value);
	}

	init() {
		this.getTokenFromCache();
	}
	
	/**
	 * 微信code换取token
	 */
	async codeLogin() {
		this._codeLoginInstance = this._codeLoginInstance 
			|| new Promise(async (resolve, reject) => {
				try {
					const { code } = await this.wxLogin();
					// 通过code向服务端换取tokenData
					const data = await this.code2Token(code);
					this.setTokenData(data);
					resolve(data);
				} catch (error) {
					reject(error);
				} finally {
					this._codeLoginInstance = null;
				}
			});
		return this._codeLoginInstance;
	}

	/**
	 * wx.login promisify
	 * @returns wx.login 返回结果
	 */
	wxLogin() {
		_wxLoginInstance = _wxLoginInstance 
			|| new Promise((resolve, reject) => {
				wx.login({
					success: (...args) => {
						resolve(...args);
						_wxLoginInstance = null;
					},
					fail(error) {
						reject(error);
						const msg = error.msg || error.message;
						msg && wx.showModal({ content: msg });
						_wxLoginInstance = null;
					}
				});
			});
		return _wxLoginInstance;
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
		if (this._tokenData === tokenData) return;
		this._tokenData = tokenData;
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