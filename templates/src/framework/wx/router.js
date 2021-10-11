import { URL } from '@wya/mp-utils';

// 当前正在准备跳转的页面（path + query 的完整路径）
let navigatingUrl = null;

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

const bootstrap = (context, options = {}) => {
	// 对路由跳转方法进行代理
	const proxy = navigateFn => {
		return async routerOpts => {
			const { url } = routerOpts;

			// 如果和正在准备跳转的页面（path+参数）相同，则阻止掉，不做跳转
			if (url === navigatingUrl) return;
			navigatingUrl = url;

			// 路由 beforeEach 导航
			if (options.beforeEach) {
				const fromUrl = getCurrentPageUrl();
				let beforeResult = options.beforeEach(
					// to
					{ url, ...parseUrl(url) },
					// from
					{ url: fromUrl, ...parseUrl(fromUrl) }
				);

				if (beforeResult && beforeResult.then) {
					beforeResult = await beforeResult;
				}
				// 如果返回的是布尔值，则返回值若为true，则进行跳转，为false则阻止跳转
				if (typeof beforeResult === 'boolean') {
					navigatingUrl = null;
					if (!beforeResult) return;
				} else if (beforeResult && beforeResult.url) {
					navigatingUrl = null;
					// 如果返回的是跳转配置，则使用返回的跳转配置进行跳转
					const { type = 'navigateTo', ...beforeRest } = beforeResult;
					// 注意：此处的跳转还是会走这些跳转检查逻辑，而非直接使用navigateFn进行跳转
					if (type === 'switchTab') {
						wx.switchTab(beforeRest);
					} else if (type === 'redirectTo') {
						wx.redirectTo(beforeRest);
					} else {
						wx.navigateTo(beforeRest);
					}
					return;
				}
			}
	
			navigateFn({
				...routerOpts,
				success: (...args) => {
					routerOpts.success && routerOpts.success(...args);
					navigatingUrl = null;
				},
				fail: (...args) => {
					outerOpts.fail && routerOpts.fail(...args);
					navigatingUrl = null;
					// 路由层级太深
					if (args[0].errMsg === 'navigateTo:fail webview count limit exceed') {
						wx.showModal({
							title: '温馨提醒：页面层级过深警告⚠️',
							content: '点击“确定”将清理您之前的页面浏览记录, 跳转至目标页面, 可能会影响您的历史操作',
							success(res) {
								res.confirm && wx.reLaunch({ url });
							}
						});
					}
				}
			});
		};
	};

	const originalSwitchTab = context.switchTab;
	const originalRedirectTo = context.redirectTo;
	const originalNavigateTo = context.navigateTo;

	Object.defineProperty(context, 'switchTab', {
		value: proxy(originalSwitchTab)
	});
	Object.defineProperty(context, 'redirectTo', {
		value: proxy(originalRedirectTo)
	});
	Object.defineProperty(context, 'navigateTo', {
		value: proxy(originalNavigateTo)
	});
};

export default bootstrap;
