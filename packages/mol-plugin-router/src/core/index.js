import { URL } from '@wya/mp-utils';
import {
	isPlainObject,
	normalizeRouteOptions,
	getCustomData,
	parseUrl
} from '../utils';

export default class RouterCore {
	constructor() {
		this.navigatingUrl = null;
	}

	/**
	 * 注册全局前置守卫
	 * @param {*} fn 
	 */
	beforeEach(fn) {
		this.beforeEachFn = fn;
	}

	/**
	 * 获取当前页面完整url
	 * @returns /xxx/xxx?yyy=z 或 null
	 */
	 getCurrentPageUrl() {
		const currentPage = getCurrentPages().pop();
		return currentPage 
			? URL.merge({
				path: `/${currentPage.route}`,
				query: currentPage.options
			})
			: null;
	}

	/**
	 * 错误处理
	 * @param {*} error 
	 */
	errorCaptured(error) {
		console.log(error);
	}

	/**
	 * 对原生跳转方法进行封装
	 * @param {*} navigateFn 平台原生跳转方法，如 wx.navigateTo
	 * @returns 返回一个封装后的方法
	 */
	patchForward(navigateFn) {
		return routerOpts => {
			const { url } = routerOpts;

			// 如果和正在准备跳转的页面（path+参数）相同，则阻止掉，不做跳转
			if (url === this.navigatingUrl) return;
			this.navigatingUrl = url;

			const next = (result) => {
				// 如果返回的是布尔值，则返回值若为true，则进行跳转，为false则阻止跳转
				if (typeof result === 'boolean' && !result) {
					this.navigatingUrl = null;
					return;
				}

				result = normalizeRouteOptions(result);

				if (isPlainObject(result) && result.url) {
					this.navigatingUrl = null;
					// 如果返回的是跳转配置，则使用返回的跳转配置进行跳转
					const { type = 'push', ...nextRest } = result;
					// 注意：此处的跳转还是会走这些跳转检查逻辑，而非直接使用navigateFn进行跳转
					const fn = this[type];
					if (typeof fn === 'function') {
						fn(nextRest);
					} else {
						this.errorCaptured(`不支持的跳转方法: "${type}"`);
					}
					return;
				}

				const { success, fail } = routerOpts;

				navigateFn({
					...routerOpts,
					success: (...args) => {
						success && success(...args);
						this.navigatingUrl = null;
					},
					fail: (...args) => {
						fail && fail(...args);
						this.navigatingUrl = null;
						this.errorCaptured(args[0]);
					}
				});
			};

			// 路由 beforeEach 导航
			if (this.beforeEachFn) {
				const fromUrl = this.getCurrentPageUrl();
				this.beforeEachFn(
					// to
					{ url, ...parseUrl(url), data: getCustomData(routerOpts) },
					// from
					{ url: fromUrl, ...parseUrl(fromUrl) },
					next
				);
			} else {
				next();
			}
		};
	}
}