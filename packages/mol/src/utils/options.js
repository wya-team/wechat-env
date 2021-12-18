import { isObject } from './base';
import { COMPONENT_LIFECYCLES } from '../constants';

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

/**
 * 标准化组件配置中的生命周期函数
 * 小程序官方推荐将生命周期函数放在lifetimes中，其优先级最高
 * 将业务中写的生命周期都转化为直接写在lifetimes中的标准数据结构
 * { attached() {...}, ... } => { lifetimes: { attached() {...}, ... } }
 * https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/lifetimes.html
 * @param {*} options 
 */
export const normalizeComponentLifecycles = (options) => {
	const { lifetimes = {} } = options;
	COMPONENT_LIFECYCLES.forEach(hookName => {
		const exposedHook = options[hookName];
		const hook = lifetimes[hookName] || exposedHook;
		if (hook) {
			lifetimes[hookName] = hook;
			exposedHook && delete options[hookName];
		}
	});
	options.lifetimes = lifetimes;
};
