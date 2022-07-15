import RouterCore from '../../core';
import install from './install';
import { isNavigationFailError, isError } from '../../utils/index';

class Router extends RouterCore {
	static install

	static platform = 'wechat'

	constructor(options = {}) {
		super(options);

		// tab 页面路径数组
		this.tabPages = options.tabPages || [];

		this._init();
	}

	_init() {
		this.__switchTab__ = this.patchForward(wx.switchTab);
		this.__reLaunch__ = this.patchForward(wx.reLaunch);
		this.__replace__ = this.patchForward(wx.redirectTo);
		this.__push__ = this.patchForward(wx.navigateTo);
		this.__back__ = this.patchBackward(wx.navigateBack);
	}

	switchTab(userOpts) {
		this.__switchTab__(userOpts);
	}

	reLaunch(userOpts) {
		this.__reLaunch__(userOpts);
	}

	replace(userOpts) {
		this.__replace__(userOpts);
	}

	push(userOpts) {
		this.__push__(userOpts);
	}

	back(userOpts) {
		this.__back__(userOpts);
	}

	getNavigateFn(nativeNavigateFn, toRoute) {
		// tab 页面可以使用 reLaunch 进行跳转
		if (this.tabPages.includes(toRoute.path) && nativeNavigateFn !== wx.reLaunch) {
			if (process.env.NODE_ENV === 'development' && Object.keys(toRoute.query).length) {
				console.warn(
					`[mol-plugin-route] 正在使用 switchTab() 跳转 tab 页面（${toRoute.path}），`
					+ `携带的参数${JSON.stringify(toRoute.query)}将会丢失。如需携带参数，可考虑使用 reLaunch()。`
				);
			}
			return wx.switchTab;
		}
		return nativeNavigateFn;
	}

	errorCaptured(error, from, to) {
		if (isNavigationFailError(error) || !isError(error)) return;

		// 路由层级太深
		if (error.errMsg === 'navigateTo:fail webview count limit exceed') {
			wx.showModal({
				title: '温馨提醒：页面层级过深警告⚠️',
				content: '点击“确定”将清理您之前的页面浏览记录, 并跳转至目标页面, 可能会影响您的历史操作',
				success: (res) => {
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