import RouterCore from '../../core';
import install from './install';
import { isNavigationFailError, isError } from '../../utils/index';

class Router extends RouterCore {
	static install

	constructor(options) {
		super(options);

		this.platform = 'wechat';

		this._init();
	}

	_init() {
		this.__switchTab__ = this.patchForward(wx.switchTab);
		this.__relaunch__ = this.patchForward(wx.relaunch);
		this.__replace__ = this.patchForward(wx.redirectTo);
		this.__push__ = this.patchForward(wx.navigateTo);
	}

	switchTab(userOpts) {
		this.__switchTab__(userOpts);
	}

	relaunch(userOpts) {
		this.__relaunch__(userOpts);
	}

	replace(userOpts) {
		this.__replace__(userOpts);
	}

	push(userOpts) {
		this.__push__(userOpts);
	}

	back(userOpts) {
		wx.navigateBack(userOpts);
	}

	errorCaptured(error, from, to) {
		if (isNavigationFailError(error) || !isError(error)) return;

		// 路由层级太深
		if (error.errMsg === 'navigateTo:fail webview count limit exceed') {
			wx.showModal({
				title: '温馨提醒：页面层级过深警告⚠️',
				content: '点击“确定”将清理您之前的页面浏览记录, 并跳转至目标页面, 可能会影响您的历史操作',
				success(res) {
					res.confirm && this.reLaunch({ path: to.path, query: to.query });
				}
			});
		} else if (this.errorCbs.length) {
			this.errorCbs.forEach(cb => {
				cb(error);
			});
		} else {
			console.error(error);
		}
	}
}

Router.install = install;

export default Router;