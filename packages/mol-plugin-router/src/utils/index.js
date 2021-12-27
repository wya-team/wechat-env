import { URL } from '@wya/mp-utils';

// 保留字段（官方api接收的字段）
const RESERVED_KEYS = [
	'url',
	'events',
	'success',
	'fail',
	'complete'
];

export const noop = () => {};

const _toString = Object.prototype.toString;
export const isPlainObject = v => _toString.call(v) === '[object Object]';

/**
 * 场景1：this.$router.push('/xxx/xxx?a=1')
 * 场景2：this.$router.push({ url: '/xxx/xxx?a=1' })
 * 场景3：this.$router.push({ path: '/xxx/xxx', query: { a: '1' } })
 * @param {*} options 
 */
export const normalizeRouteOptions = options => {
	// 场景1：直接传url字符串的情况处理
	if (typeof options === 'string') {
		options = {
			url: options
		};
	} else if (isPlainObject(options)) {
		const { url, path, query = {}, ...rest } = options;
		if (url) {
			// 场景2：对象中传url的情况处理
			options = {
				...rest,
				url
			};
		} else if (path) {
			// 场景3：对象中不传url，传path、query的情况处理
			options = {
				...rest,
				url: URL.merge({ path, query }),
			};
		}
	}
	return options;
};

/**
 * 从开发者传入的路由options中筛选出开发者自定义的一些数据
 * @param {*} userRouterOpts 
 * @returns 
 */
export const getCustomData = (userRouterOpts) => {
	const customData = {};
	Object.keys(userRouterOpts).forEach(key => {
		if (!RESERVED_KEYS.includes(key)) {
			customData[key] = userRouterOpts[key];
		}
	});
	return customData;
};

export const parseUrl = url => {
	const result = URL.parse(url);
	result.path = result.path.join('/');
	return result;
};