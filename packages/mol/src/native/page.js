import { Utils } from '@wya/mp-utils';
import { patchPage } from '../patch/index';

export default (setupOptions) => {
	const { middlewares = [] } = setupOptions;
	/**
	 * 注意：
	 * 中间件注册顺序为从前往后（Utils.compose实现原因），但实际代理的方法的执行顺序是从后往前的
	 * 示例：Utils.compose(A, B)，A、B均对onLoad进行代理，
	 * 则注册顺序：先注册 A，再注册 B，
	 * onLoad执行顺序：先执行 B 代理过的onLoad，再执行 A 代理过的 onLoad
	 */
	const page = Utils.compose(...middlewares)(Page);

	return pageOptions => {
		// 最先执行patch，保证在到达业务层的前一步会做可能需要的wait
		pageOptions = patchPage(pageOptions);
		
		return page(pageOptions);
	};
};