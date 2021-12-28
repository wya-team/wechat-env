// 导航失败类型
export const NAVIGATION_FAIL_TYPE = {
	redirected: 2, // 在导航守卫中调用了 next(newLocation) 重定向到了其他地方
	aborted: 4, // 在导航守卫中调用了 next(false) 中断了本次导航
	cancelled: 8, // 在当前导航还没有完成之前又有了一个新的导航。比如，在等待导航守卫的过程中又调用了 router.push
	duplicated: 16, // 导航被阻止，因为我们已经在目标位置了或者当前正在跳转导航与目标位置相同
	unsupported: 32 // 不支持的导航方法
};

const createRouterError = (from, to, type, message) => {
	const error = new Error(message);
	error.from = from;
	error.to = to;
	error.type = type;
	error._isRouter = true;
	
	return error;
};

export function createNavigationRedirectedError(from, to) {
	return createRouterError(
	  from,
	  to,
	  NAVIGATION_FAIL_TYPE.redirected,
	  `Redirected when going from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`
	);
}

export function createNavigationAbortedError(from, to) {
	return createRouterError(
	  from,
	  to,
	  NAVIGATION_FAIL_TYPE.aborted,
	  `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`
	);
}

export function createNavigationDuplicatedError(from, to) {
	const error = createRouterError(
	  from,
	  to,
	  NAVIGATION_FAIL_TYPE.duplicated,
	  `Avoided redundant navigation from "${from.fullPath}" to "${to.fullPath}".`
	);
	error.name = 'NavigationDuplicated';
	return error;
}

export const createUnsupportedNavigationError = (name) => {
	const error = new Error(`Unsupported navigation method: "${name}"`);
	error.type = NAVIGATION_FAIL_TYPE.unsupported;
	error._isRouter = true;

	return error;
};

export const isError = err => Object.prototype.toString.call(err).indexOf('Error') > -1;

export const isNavigationFailError = err => isError(err) && err._isRouter;
