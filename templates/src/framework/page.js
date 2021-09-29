import storeMiddleware, { mapActions } from '@wya/mp-store';
import { Utils } from '@wya/mp-utils';
import { net } from './network/index';
import { navigator, share } from './middlewares/index';

/**
 * 注意：
 * 中间件注册顺序为从前往后（Utils.compose实现原因），但实际代理的方法的执行顺序是从后往前的
 * 示例：Utils.compose(A, B)，A、B均对onLoad进行代理，
 * 则注册顺序：先注册 A，再注册 B，
 * onLoad执行顺序：先执行 B 代理过的onLoad，再执行 A 代理过的 onLoad
 */
let PageEnhancer = Utils.compose(
	navigator,
	share,
	storeMiddleware,
	// 其他中间件
)(Page);

export default (userOptions = {}) => {
	const options = {
		$request: net.ajax,
		...mapActions(['request']),
		...userOptions,
	};
	return PageEnhancer(options);
};
