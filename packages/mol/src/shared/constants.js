// 自定义的app生命周期，将会在app.onShow前触发，且不会等待lifecycleWaitingTask
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

export const COMPONENT_LIFECYCLES = [
	'created',
	'attached',
	'ready',
	'moved',
	'detached',
	'error'
];

export const COMPONENT_PAGE_LIFECYCLES = [
	'show',
	'hide',
	'resize'
];