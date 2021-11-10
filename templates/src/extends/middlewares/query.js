/**
 * 用于给页面注入$query
 */
import dola from '@wya/mp-framework';

 export default (next) => userOptions => {
	const { onLoad, ...rest } = userOptions;

	const proxy = hook => {
		return async function (query) {
			const queryParser = dola.queryParser
			this.$query = queryParser ? await queryParser.parse(query) : query
			hook && hook.call(this, this.$query)
		}
	};
	rest.onLoad = proxy(onLoad)
	return next(rest);
};