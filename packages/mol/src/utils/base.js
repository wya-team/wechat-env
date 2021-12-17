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

export const remove = (arr, item) => {
	if (arr.length) {
		const index = arr.indexOf(item);
		index > -1 && arr.splice(index, 1);
	}
};

export const noop = () => {};
