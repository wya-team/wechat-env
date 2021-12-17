import {
	def,
	hasOwn,
	isObject,
	isPlainObject
} from '../utils';

import Dep from './dep';
import { arrayMethods } from './array';

export class Observer {
	constructor(value) {
		this.value = value;
		this.dep = new Dep();

		def(value, '__ob__', this);

		if (Array.isArray(value)) {
			Object.setPrototypeOf(value, arrayMethods);
			this.observeArray(value);
		} else {
			this.observePlainObj(value);
		}
	}

	/**
	 * 对数组的每项做监听
	 * @param {*} array 
	 */
	observeArray(array) {
		array.forEach(it => {
			/* eslint-disable no-use-before-define */
			observe(it);
			/* eslint-enable no-use-before-define */
		});
	}

	observePlainObj(obj) {
		Object.keys(obj).forEach(key => {
			/* eslint-disable no-use-before-define */
			reactive(obj, key);
			/* eslint-enable no-use-before-define */
		});
	}

}

/**
 * 将一个object或者array变成可观察的
 * @param {*} value 
 */
export function observe(value) {
	if (!isObject(value)) return;
	
	let ob;
	if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
		ob = value.__ob__;
	} else if ((isPlainObject(value) || Array.isArray(value)) && Object.isExtensible(value)) {
		ob = new Observer(value);
	}
	return ob;
}

export const reactive = (obj, key, val, shallow) => {
	const property = Object.getOwnPropertyDescriptor(obj, key);
	if (property && property.configurable === false) return;

	const getter = property && property.get;
	const setter = property && property.set;

	if (arguments.length === 2) {
		val = obj[key];
	}

	// 闭包方式，watcher收集器
	const dep = new Dep();

	const childOb = !shallow && observe(val);
	
	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,
		get() {
			const value = getter ? getter.call(obj) : val;
			// 将该依赖作为当前的watcher依赖收集起来
			dep.depend();
			return value;
		},
		set(newValue) {
			const value = getter ? getter.call(obj) : val;
			if (value === newValue) return;

			if (setter) {
				setter.call(obj, newValue);
			} else {
				val = newValue;
			}
			// 通知依赖该数据的watcher进行更新
			dep.notify();
		}
	});
};


