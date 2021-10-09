import storeMiddleware, { mapActions } from '@wya/mp-store';
import { Utils } from '@wya/mp-utils';

const bootstrap = bootstrapOpts => {
	const { middlewares = [], request } = bootstrapOpts;
	/**
	 * 注意：
	 * 中间件注册顺序为从前往后（Utils.compose实现原因），但实际代理的方法的执行顺序是从后往前的
	 * 示例：Utils.compose(A, B)，A、B均对attached进行代理，
	 * 则注册顺序：先注册 A，再注册 B，
	 * attached执行顺序：先执行 B 代理过的attached，再执行 A 代理过的 attached
	 */
	const ComponentEnhancer = Utils.compose(
		...middlewares,
		storeMiddleware,
		// 其他注入
	)(Component);

	return (userOptions = {}) => {
		const { externalClasses = [], options = {}, properties = {}, methods = {}, ...rest } = userOptions;
		if (!externalClasses.includes('custom-class')) {
			externalClasses.push('custom-class');
		}
		return ComponentEnhancer({
			...rest,
			options: {
				addGlobalClass: true,
				multipleSlots: true,
				...options
			},
			externalClasses,
			properties: {
				customStyle: String,
				...properties,
			},
			methods: {
				...methods,
				$request: request,
				...mapActions(['request']),
				$emit(...args) {
					this.triggerEvent(...args);
				},
			}
		});
	};
};

export default bootstrap;
