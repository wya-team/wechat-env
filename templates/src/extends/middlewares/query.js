/**
 * 用于给页面注入$query
 */
import Mol from '@wya/mol';

 export default (next) => userOptions => {
	const { onLoad, ...rest } = userOptions;

	const proxy = hook => {
		return async function (query) {
			const queryParser = Mol.queryParser
			this.$query = queryParser ? await queryParser.parse(query) : query
			hook && hook.call(this, this.$query)
		}
	};
	rest.onLoad = proxy(onLoad)
	return next(rest);
};