import { URL } from '@wya/mp-utils';
import { isPlainObject } from './base';

export const isSameRoute = (a, b) => {
	return a && b && a.fullPath === b.fullPath;
};

/**
 * 获取当前页面完整url
 * @returns /xxx/xxx?yyy=z 或 null
 */
export const getCurrentPageUrl = () => {
	const currentPage = getCurrentPages().pop();
	if (!currentPage) return null;

	const res = {
		path: `/${currentPage.route}`,
		query: currentPage.options
	};
	res.fullPath = URL.merge(res);
	return res;
};

export const parseUrl = url => {
	const result = URL.parse(url);
	result.path = result.path.join('/');
	return result;
};

/**
 * 场景1：this.$router.push('/xxx/xxx?a=1')
 * 场景2：this.$router.push({ path: '/xxx/xxx?a=1' })
 * 场景3：this.$router.push({ path: '/xxx/xxx', query: { a: '1' } })
 * @param {*} route 
 */
export const createRoute = route => {
	// 场景1：直接传url字符串的情况处理
	if (typeof route === 'string') {
		const url = route;
		const { path, query } = parseUrl(url);
		route = {
			fullPath: url,
			path,
			query,
			native: { url }
		};
	} else if (isPlainObject(route)) {
		let { path, query = {}, ...rest } = route;
		const url = URL.merge({ path, query });
		// path中带有部分参数的场景
		if (path.indexOf('?') > -1) {
			const res = parseUrl(url);
			path = res.path;
			query = res.query;
		}
		route = {
			fullPath: url,
			path,
			query,
			native: { ...rest, url }
		};
	}
	return route;
};

export const getCurrentRoute = () => {
	const res = getCurrentPageUrl();
	return res 
		? { ...res, native: null }
		: null;
};
