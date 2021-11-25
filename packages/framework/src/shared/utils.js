/**
 * function check
 */
export const isFunc = v => typeof v === 'function';

/**
 * object check
 */
export const isObject = v => v !== null && typeof v === 'object';

const _toString = Object.prototype.toString;
export const isPlainObject = v => _toString.call(v) === '[object Object]';

const hasOwnProperty = Object.hasOwnProperty;
export const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

export const def = (obj, key, val, enumerable) => {
	return Object.defineProperty(obj, key, {
		value: val,
		enumerable: !!enumerable,
		writable: true,
		configurable: true
	});
};

/**
 * 合并配置项
 * 如果为覆盖型配置（即非数组或Object的配置项），则优先级从左到右递增
 */
export const mergeOptions = (...optionsList) => {
	return optionsList.reduce((opts, cur) => {
		Object.entries(cur).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				opts[key] = [...new Set([...(opts[key] || []), ...value])];
			} else if (isObject(value)) {
				opts[key] = {
					...(opts[key] || {}),
					...value
				};
			} else {
				opts[key] = value;
			}
		});
		return opts;
	}, {});
};

export const remove = (arr, item) => {
	if (arr.length) {
		const index = arr.indexOf(item);
		index > -1 && arr.splice(index, 1);
	}
};

export const noop = () => {};
