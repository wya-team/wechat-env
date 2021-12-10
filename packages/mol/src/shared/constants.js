/**
 * 自定义的app生命周期，将会在app.onShow前触发，且不会等待lifecycleWaitingTask
 */
export const APP_BEFORE_SHOW = 'onBeforeShow';

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
export const APP_WAIT_LIFECYCLES = APP_LIFECYCLES.filter(it => it !== 'onLaunch');

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

export const PAGE_WAIT_LIFECYCLES = PAGE_LIFECYCLES;

export const COMPONENT_LIFECYCLES = [
	'created',
	'attached',
	'ready',
	'moved',
	'detached',
	'error'
];

export const COMPONENT_WAIT_LIFECYCLES = COMPONENT_LIFECYCLES;

export const COMPONENT_PAGE_LIFECYCLES = [
	'show',
	'hide',
	'resize'
];