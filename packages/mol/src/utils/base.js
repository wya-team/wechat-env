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

export const makeMap = (str) => {
	const map = Object.create(null);
	const list = str.split(',');
	for (let i = 0; i < list.length; i++) {
		map[list[i]] = true;
	}
	return key => map[key];
};

/**
 * 判断某个字段是否为保留字段（不允许传入原生构造配置中）
 */
export const isReservedField = makeMap('router');

export const getValueDescriptor = value => {
	return {
		configurable: true,
		enumerable: true,
		writable: true,
		value
	};
};
