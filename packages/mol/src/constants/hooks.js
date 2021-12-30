/**
 * App 原生提供的钩子函数
 */
export const APP_NATIVE_HOOKS = [
	'onLaunch',
	'onShow',
	'onHide',
	'onError',
	'onPageNotFound',
	'onUnhandledRejection',
	'onThemeChange'
];

/**
 * Mol.app额外钩子函数
 */
const APP_CUSTOM_HOOKS = [
	'beforeLaunch',
	'beforeShow'
];

/**
 * App的全部钩子函数（原生+自定义）
 */
export const APP_HOOKS = [
	...APP_NATIVE_HOOKS,
	...APP_CUSTOM_HOOKS
];

/**
 * App的钩子中，需等待全局预处理任务的钩子
 */
export const APP_WAIT_HOOKS = [
	'onShow',
	'onHide'
];


/**
 * Page 原生提供的钩子函数
 */
export const PAGE_NATIVE_HOOKS = [
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
 * Mol.page额外钩子函数
 */
const PAGE_CUSTOM_HOOKS = [
	'beforeCreate',
	'created'
];

/**
 * 页面中需要return数据的钩子
 */
const PAGE_EXIST_RETURN_HOOKS = [
	'onShareAppMessage',
	'onShareTimeline',
	'onAddToFavorites'
];

/**
 * Mol.page 的全部钩子
 */
export const PAGE_HOOKS = [
	...PAGE_NATIVE_HOOKS,
	...PAGE_CUSTOM_HOOKS
];

/**
 * 页面中可合并成数组的钩子
 */
export const PAGE_MERGE_HOOKS = PAGE_HOOKS.filter(hook => !PAGE_EXIST_RETURN_HOOKS.includes(hook));

/**
 * 页面钩子中，需等待全局预处理任务的钩子
 */
export const PAGE_WAIT_HOOKS = [
	'onLoad',
	'onShow',
	'onReady',
	'onHide',
	'onUnload',
	'onPullDownRefresh'
];




/**
 * Component 的原生钩子
 */
export const COMPONENT_NATIVE_HOOKS = [
	'created',
	'attached',
	'ready',
	'moved',
	'detached',
	'error'
];

/**
 * Mol.component 提供的额外钩子
 */
const COMPONENT_CUSTOM_HOOKS = [
	'beforeCreate',
	'beforeAttach'
];

/**
 * 组件全部钩子
 */
export const COMPONENT_HOOKS = [
	...COMPONENT_NATIVE_HOOKS,
	...COMPONENT_CUSTOM_HOOKS
];

/**
 * 组件的钩子中，需等待全局预处理任务的钩子
 */
export const COMPONENT_WAIT_HOOKS = [
	'created',
	'attached',
	'ready',
	'moved',
	'detached'
];

/**
 * 组件中的页面钩子
 */
export const COMPONENT_PAGE_HOOKS = [
	'show',
	'hide',
	'resize'
];

/**
 * 组件配置项中的页面生命周期中，需要等待task的生命周期
 */
export const COMPONENT_PAGE_WAIT_HOOKS = [
	'show',
	'hide'
];
