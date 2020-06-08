import { URL } from '@wya/mp-utils';

/**
 * wx 全局变量
 */
class Enhancer {
	static invoke(target, opts) {
		if (target === wx) {
			this._navigateAuto(opts);
			this._fn2promise(opts);
		}
	}

	static _navigateAuto(opts = {}) {
		const { tabs, authorizes, promises = [] } = opts;

		let originalSwitchTab = wx.switchTab;
		let originalRedirectTo = wx.redirectTo;
		let originalNavigateTo = wx.navigateTo;
		let migrating = () => {
			wx.showModal({ title: `方法变更：请使用 wx.navigateAuto` });
		};

		Object.defineProperty(wx, 'switchTab', { value: migrating });
		Object.defineProperty(wx, 'redirectTo', { value: migrating });
		Object.defineProperty(wx, 'navigateTo', { value: migrating });
		
		wx.navigateAuto = (opts = {}) => {
			const { url, redirect, ...rest } = opts;
			if (!url) {
				wx.navigateBack();
				return;
			}

			let { query = {}, path = [] } = URL.parse(url);
			let fn = () => {
				let options = { url, ...rest };
				if (tabs.includes(path.join('/'))) {
					originalSwitchTab(options);
					return;
				}

				if (redirect) {
					originalRedirectTo(options);
				} else {
					originalNavigateTo(options);
				}
			};

			if (!authorizes.includes(path.join('/'))) {
				return fn();
			}
			// TODO: 单独抽离
			let app = getApp();

			if (app.configData.authorize) {
				fn();
			} else {
				let page = getCurrentPages().pop();

				if (page && page.route !== 'pages/auth/index') {
					originalRedirectTo({ url: `/pages/auth/index?url=${url}` });
				} else if (page) {
					wx.showModal({ title: `请点击授权` });
				}
			}
		};
	}

	static _fn2promise(opts = {}) {
		
	}
}

export default Enhancer;