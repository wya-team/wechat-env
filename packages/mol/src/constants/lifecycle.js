/**
 * App的生命周期
 */
export const APP_LIFECYCLES = [
	'beforeLaunch', // Mol custom
	'onLaunch',
	'beforeShow', // Mol custom
	'onShow',
	'onHide',
	'onError',
	'onPageNotFound',
	'onUnhandledRejection',
	'onThemeChange'
];

/**
 * App的生命周期中，需要等待task的生命周期
 */
export const APP_WAIT_LIFECYCLES = [
	'onShow',
	'onHide'
];

/**
 * 页面的生命周期
 */
export const PAGE_LIFECYCLES = [
	'beforeCreate', // Mol custom
	'created', // Mol custom
	'onLoad',
	'onShow',
	'onReady',
	'onHide',
	'onUnload',
	'onPullDownRefresh',
	'onReachBottom',
	'onShareAppMessage',
	'onShareTimeline',
	'onAddToFavorites',
	'onPageScroll',
	'onResize',
	'onTabItemTap',
	'onSaveExitState'
];

/**
 * 页面的生命周期中，需要等待task的生命周期
 */
export const PAGE_WAIT_LIFECYCLES = [
	'onLoad',
	'onShow',
	'onReady',
	'onHide',
	'onUnload',
	'onPullDownRefresh'
];

/**
 * 组件的生命周期
 */
export const COMPONENT_LIFECYCLES = [
	'beforeCreate', // Mol custom
	'created',
	'beforeAttach', // Mol custom
	'attached',
	'ready',
	'moved',
	'detached',
	'error'
];

/**
 * 组件的生命周期中，需要等待task的生命周期
 */
export const COMPONENT_WAIT_LIFECYCLES = [
	'created',
	'attached',
	'ready',
	'moved',
	'detached'
];

/**
 * 组件配置项中的页面生命周期
 */
export const COMPONENT_PAGE_LIFECYCLES = [
	'show',
	'hide',
	'resize'
];

/**
 * 组件配置项中的页面生命周期中，需要等待task的生命周期
 */
export const COMPONENT_PAGE_WAIT_LIFECYCLES = [
	'show',
	'hide'
];