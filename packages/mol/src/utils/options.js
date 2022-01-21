import {
	isFunc,
	isPlainObject
} from './base';
import {
	APP_HOOKS,
	COMPONENT_HOOKS,
	PAGE_MERGE_HOOKS,
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
	} else if (isFunc(base[key])) {
		base[key] = [base[key]];
	}
	
	if (Array.isArray(target)) {
		base[key].push(...target);
	} else if (!base[key].includes(target)) {
		base[key].push(target);
	}
};

const mergeInjector = mergeHook;

const mergeMethods = (base, methods, isComponent) => {
	let method;

	if (isComponent && !base.methods) {
		base.methods = {};
	}
	
	Object.keys(methods).forEach(key => {
		method = methods[key];
		if (typeof method === 'function') {
			isComponent
				? base.methods[key] = method
				: base[key] = method;
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
export const normalizeComponentHooks = (options) => {
	const { lifetimes = {} } = options;
	COMPONENT_HOOKS.forEach(hookName => {
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

	const _props = {
		...props,
		...properties
	};
	let types;

	// array type -> type, optionalTypes
	Object.keys(_props).forEach(propKey => {
		const prop = _props[propKey];

		if (isPlainObject(prop) && Array.isArray(prop.type)) {
			types = prop.type;
			if (types.length > 1) {
				prop.optionalTypes = types.slice(1);
			}
			prop.type = types[0];
		}
	});
	options.properties = _props;
	delete options.props;
};

export const normalizeComponentOptions = options => {
	normalizeProps(options);
	normalizeComponentHooks(options);    
};

/**
 * 合并配置项
 * 合并顺序从左到右
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
				key === 'methods'
					? mergeMethods(mergedOptions, value, isComponent)
					: mergePlainObject(mergedOptions, value, key);

			} else if (key === 'injector') {
				mergeInjector(mergedOptions, value, key);
				
			} else if (typeof value !== 'undefined') {
				mergedOptions[key] = value;
			}
		});
		return mergedOptions;
	}, isComponent ? { lifetimes: {}, pageLifetimes: {} } : {});
	
	return options;
};

export const mergeAppOptions = (...optionsList) => {
	return mergeOptions(false, APP_HOOKS, ...optionsList);
};

export const mergePageOptions = (...optionsList) => {
	return mergeOptions(false, PAGE_MERGE_HOOKS, ...optionsList);
};

export const mergeComponentOptions = (...optionsList) => {
	return mergeOptions(true, undefined, ...optionsList);
};

export const resolveConstructorOptions = Ctor => {
	let { options } = Ctor;
	if (Ctor.super) {
		const superOptions = resolveConstructorOptions(Ctor.super);
		const { type } = Ctor;
		if (type === 'page') {
			options = mergePageOptions(superOptions, options);
		} else if (type === 'component') {
			options = mergeComponentOptions(superOptions, options);
		} else if (type === 'app') {
			options = mergeAppOptions(superOptions, options);
		} else {
			options = mergeOptions(false, undefined, superOptions, options);
		}
	}
	return options;
};
