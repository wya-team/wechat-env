import { URL } from '@wya/mp-utils';

// 保留字段（官方api接收的字段）
const RESERVED_KEYS = [
	'url',
	'events',
	'success',
	'fail',
	'complete'
];

// 当前正在准备跳转的页面（path + query 的完整路径）
let navigatingUrl = null;
// let 

const _toString = Object.prototype.toString;
const isPlainObject = v => _toString.call(v) === '[object Object]';

const getCurrentPageUrl = () => {
	const currentPage = getCurrentPages().pop();
	return currentPage 
		? URL.merge({
			path: `/${currentPage.route}`,
			query: currentPage.options
		})
		: null;
};

const parseUrl = url => {
	const result = URL.parse(url);
	result.path = result.path.join('/');
	return result;
};

/**
 * 从开发者传入的路由options中筛选出开发者自定义的一些字段
 * @param {*} userRouterOpts 
 * @returns 
 */
const getFreeOptions = (userRouterOpts) => {
	const freeOptions = {};
	Object.keys(userRouterOpts).forEach(key => {
		if (!RESERVED_KEYS.includes(key)) {
			freeOptions[key] = userRouterOpts[key];
		}
	});
	return freeOptions;
};

const install = (Mol, wxCtx, options = {}) => {
	const { beforeEach } = options;
	// 对路由跳转方法进行代理
	const proxy = navigateFn => {
		return routerOpts => {
			const { url } = routerOpts;

			// 如果和正在准备跳转的页面（path+参数）相同，则阻止掉，不做跳转
			if (url === navigatingUrl) return;
			navigatingUrl = url;

			const next = (result) => {
				// 如果返回的是布尔值，则返回值若为true，则进行跳转，为false则阻止跳转
				if (typeof result === 'boolean' && !result) {
					navigatingUrl = null;
					return;
				}

				if (isPlainObject(result) && result.url) {
					navigatingUrl = null;
					// 如果返回的是跳转配置，则使用返回的跳转配置进行跳转
					const { type = 'navigateTo', ...nextRest } = result;
					// 注意：此处的跳转还是会走这些跳转检查逻辑，而非直接使用navigateFn进行跳转
					const fn = wxCtx[type];
					typeof fn === 'function' ? fn(nextRest) : wxCtx.navigateTo(nextRest);
					return;
				}

				const { success, fail } = routerOpts;

				navigateFn({
					...routerOpts,
					success: (...args) => {
						success && success(...args);
						navigatingUrl = null;
					},
					fail: (...args) => {
						fail && fail(...args);
						navigatingUrl = null;
						// 路由层级太深
						if (args[0].errMsg === 'navigateTo:fail webview count limit exceed') {
							wxCtx.showModal({
								title: '温馨提醒：页面层级过深警告⚠️',
								content: '点击“确定”将清理您之前的页面浏览记录, 并跳转至目标页面, 可能会影响您的历史操作',
								success(res) {
									res.confirm && wxCtx.reLaunch({ url });
								}
							});
						}
					}
				});
			};

			// 路由 beforeEach 导航
			if (beforeEach) {
				const fromUrl = getCurrentPageUrl();
				beforeEach(
					// to
					{ url, ...parseUrl(url), data: getFreeOptions(routerOpts) },
					// from
					{ url: fromUrl, ...parseUrl(fromUrl) },
					next
				);
			} else {
				next();
			}
		};
	};

	const originalSwitchTab = wxCtx.switchTab;
	const originalRedirectTo = wxCtx.redirectTo;
	const originalNavigateTo = wxCtx.navigateTo;

	Object.defineProperty(wxCtx, 'switchTab', {
		value: proxy(originalSwitchTab)
	});
	Object.defineProperty(wxCtx, 'redirectTo', {
		value: proxy(originalRedirectTo)
	});
	Object.defineProperty(wxCtx, 'navigateTo', {
		value: proxy(originalNavigateTo)
	});
};

export default install;
