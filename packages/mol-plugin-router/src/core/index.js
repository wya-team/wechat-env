import {
	isSameRoute,
	isPlainObject,
	isError,
	isNavigationFailError,
	createRoute,
	getCurrentRoute,
	createNavigationRedirectedError,
	createNavigationAbortedError,
	createNavigationDuplicatedError,
	createUnsupportedNavigationError
} from '../utils';

export default class RouterCore {
	__switchTab__

	constructor() {
		this.navigatingUrl = null;
		this.currentRoute = null;
		this.pendingRoute = null;
		this.errorCbs = [];
	}

	/**
	 * 注册全局前置守卫
	 * @param {*} fn 
	 */
	beforeEach(fn) {
		this.beforeEachFn = fn;
	}

	onError(fn) {
		this.errorCbs.push(fn);
	}

	/**
	 * 错误处理
	 * @param {*} error 
	 */
	errorCaptured(error) {
		// 将未知的错误交由外部处理
		if (isNavigationFailError(error) || !isError(error)) return;

		if (this.errorCbs.length) {
			this.errorCbs.forEach(cb => {
				cb(error);
			});
		} else {
			console.error(error);
		}
	}

	_abort(error, abort) {
		this.errorCaptured(error);
		abort && abort(error);
	}

	/**
	 * 对原生跳转方法进行封装
	 * @param {*} navigateFn 平台原生跳转方法，如 wx.navigateTo
	 * @returns 返回一个封装后的方法
	 */
	patchForward(navigateFn) {
		return routeOpts => {
			return new Promise((resolve, reject) => {
				const toRoute = createRoute(routeOpts);

				// 如果目标页面和当前页面或正在跳转的页面相同（fullPath相同），则阻止掉，不做跳转
				if (isSameRoute(toRoute, this.pendingRoute) || isSameRoute(toRoute, this.currentRoute)) {
					this._abort(createNavigationDuplicatedError(this.currentRoute, toRoute), reject);
					return;
				}

				this.pendingRoute = toRoute;

				const next = (result) => {
					// 如果返回false则阻止跳转
					if (result === false) {
						this._abort(createNavigationAbortedError(this.currentRoute, toRoute), reject);
						this.pendingRoute = null;
						return;
					}

					const isObj = isPlainObject(result);
					if (isObj || typeof result === 'string') {
						this._abort(createNavigationRedirectedError(this.currentRoute, toRoute), reject);
						this.pendingRoute = null;
						// 如果返回的是跳转配置，则使用返回的跳转配置进行跳转
						const type = isObj && result.type ? result.type : 'push';
						// 注意：此处的跳转还是会走这些跳转检查逻辑，而非直接使用navigateFn进行跳转
						const fn = this[type];
						if (typeof fn === 'function') {
							fn.call(this, result);
						} else {
							this.errorCaptured(createUnsupportedNavigationError(type));
						}
						return;
					}

					const { native } = toRoute;

					navigateFn({
						...native,
						success: (...args) => {
							const { success } = native;
							success && success(...args);
							this.currentRoute = this.pendingRoute;
							this.pendingRoute = null;
							resolve();
						},
						fail: (...args) => {
							const { fail } = native;
							fail && fail(...args);
							this.pendingRoute = null;
							const error = args[0]
							this.errorCaptured(error, this.currentRoute, toRoute);
							reject(args[0]);
						}
					});
				};

				// 路由 beforeEach 导航
				if (this.beforeEachFn) {
					this.beforeEachFn(
						toRoute,
						this.currentRoute || (this.currentRoute = getCurrentRoute()),
						next
					);
				} else {
					next();
				}
			});
		};
	}
}