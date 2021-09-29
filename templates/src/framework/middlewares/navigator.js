/**
 * 用于页面卸载时清除页面store数据的中间件
 * 需在页面注册options中指定 navigator: 'XXX'，'XXX'对应store中名为 'XXX_ROUTE_CHANGE' 的mutation
 */
export default (next) => userOptions => {
	const { onUnload, navigator, ...rest } = userOptions;

	const proxy = hook => {
		return navigator
			? options => {
				this.$store.commit(`${navigator}_ROUTE_CHANGE`);
				hook && hook.call(this, options);
			}
			: hook;
	};
	return next({
		...rest,
		onUnload: proxy(onUnload),
	});
};