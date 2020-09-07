const app = getApp();

export const navigatorMiddleware = (next) => userOptions => {
	const { onLoad, navigator, ...rest } = userOptions;

	const on = (hook) => {
		return function (options) {
			navigator && this.$store.commit(`${navigator}_ROUTE_CHANGE`);
			if (typeof hook === 'function') {
				hook.call(this, options);
			}
		};
	};
	return next({
		...rest,
		onLoad: on(onLoad),
	});
};