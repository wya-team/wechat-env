/**
 * function check
 */
export const isFunc = v => typeof v === 'function';

/**
 * object check
 */
export const isObject = v => v !== null && typeof v === 'object';

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