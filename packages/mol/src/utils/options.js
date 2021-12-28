import { isFunc } from './base';
import {
	APP_LIFECYCLES,
	PAGE_LIFECYCLES,
	COMPONENT_LIFECYCLES,
	COMPONENT_PAGE_LIFECYCLES,
	PLAIN_OBJECT_FIELDS
} from '../constants';

/**
 * 合并钩子函数
 * @param {*} base 
 * @param {*} target 
 * @param {*} key 
 * @returns 
 */
const mergeHook = (base, target, key) => {
	if (!base[key]) {
		base[key] = [];
	}
	if (isFunc(base[key])) {
		base[key] = [base[key]];
	}
	if (base[key].includes(target)) return;
	base[key].push(target);
};

const convertHooks = (options, hookNames) => {
	hookNames.forEach(hookName => {
		const hooks = options[hookName];
		if (hooks) {
			options[hookName] = function (...args) {
				for (let i = 0; i < hooks.length; i++) {
					hooks[i].apply(this, args);
				}
			};
		}
	});
};

const mergeArray = (base, target, key) => {
	if (!base[key]) {
		base[key] = [];
	}
	target.forEach(i => {
		!base[key].includes(i) && base[key].push(i);
	});
};

const mergePlainObject = (base, target, key) => {
	if (!base[key]) {
		base[key] = {};
	}
	Object.keys(target).forEach(_key => {
		if (typeof target[_key] !== 'undefined') {
			base[key][_key] = target[_key];
		}
	});
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

export const normalizeProps = (options) => {
	const { props = {}, properties = {} } = options;

	options.properties = {
		...props,
		...properties
	};
	delete options.props;
};

export const normalizeComponentOptions = options => {
	normalizeProps(options);
	normalizeComponentLifecycles(options);
};

/**
 * 合并配置项
 * 如果为覆盖型配置（即非数组或Object的配置项），则优先级从左到右递增
 */
export const mergeOptions = (isComponent, hooks = [], ...optionsList) => {
	const options = optionsList.reduce((mergedOptions, cur) => {
		Object.entries(cur).forEach(([key, value]) => {
			if (isComponent && (key === 'lifetimes' || key === 'pageLifetimes')) {
				Object.keys(value).forEach(hookName => {
					mergeHook(mergedOptions[key], value[hookName], hookName);
				});
			} else if (hooks.includes(key)) {
				mergeHook(mergedOptions, value, key);
			} else if (key === 'mixins' && value.length) {
				// 将mixins合并进来
				isComponent && value.forEach(mixinItem => {
					normalizeComponentOptions(mixinItem);
				});
				mergedOptions = mergeOptions(isComponent, hooks, mergedOptions, ...value);
			} else if (Array.isArray(value) && key !== 'behaviors') {
				mergeArray(mergedOptions, value, key);
			} else if (PLAIN_OBJECT_FIELDS.includes(key)) {
				mergePlainObject(mergedOptions, value, key);
			} else if (typeof value !== 'undefined') {
				mergedOptions[key] = value;
			}
		});
		return mergedOptions;
	}, isComponent ? { lifetimes: {}, pageLifetimes: {} } : {});
	
	return options;
};

export const mergeAppOptions = (...optionsList) => {
	const options = mergeOptions(false, APP_LIFECYCLES, ...optionsList);
	convertHooks(options, APP_LIFECYCLES);
	return options;
};

export const mergePageOptions = (...optionsList) => {
	const options = mergeOptions(false, PAGE_LIFECYCLES, ...optionsList);
	convertHooks(options, PAGE_LIFECYCLES);
	return options;
};

export const mergeComponentOptions = (...optionsList) => {
	const options = mergeOptions(true, undefined, ...optionsList);
	convertHooks(options.lifetimes, COMPONENT_LIFECYCLES);
	convertHooks(options.pageLifetimes, COMPONENT_PAGE_LIFECYCLES);
	return options;
};

export const resolveConstructorOptions = Ctor => {
	let { options } = Ctor;
	if (Ctor.super) {
		const superOptions = resolveConstructorOptions(Ctor.super);
		const { name } = Ctor;
		if (name === 'MolPage') {
			options = mergePageOptions(superOptions, options);
		} else if (name === 'MolComponent') {
			options = mergeComponentOptions(superOptions, options);
		} else if (name === 'MolApp') {
			options = mergeAppOptions(superOptions, options);
		} else {
			options = mergeOptions(false, undefined, superOptions, options);
		}
	}
	return options;
};
