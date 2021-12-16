/**
 * 用于解析页面query，并给页面注入$query
 */
import Mol from '@wya/mol';

export default (next) => userOptions => {
	const { onLoad, ...rest } = userOptions;

	const patch = hook => {
		return async function (query) {
			hook && hook.call(this, query);
			try {
				// 中间件内不允许在生命周期hook前await，不然会将该hook多延后一个微任务队列
				// 需要等待的逻辑都可添加到生命周期等待任务中
				this.$query = await Mol.queryParser.parse(query);
			} catch (error) {
				this.$query = query;
			}
		};
	};
	rest.onLoad = patch(onLoad);
	return next(rest);
};