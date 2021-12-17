/**
 * 自定义的app生命周期，将会在app.onShow前触发，且不会等待lifecycleWaitingTask
 */
export const APP_BEFORE_SHOW = 'onBeforeShow';

/**
 * App的生命周期
 */
export const APP_LIFECYCLES = [
	'onLaunch',
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
	'created',
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