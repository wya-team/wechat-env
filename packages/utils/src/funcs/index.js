import {
	getUid,
	preZero,
	def,
	isObj,
	hasOwn,
	cloneDeep,
	cloneDeepEasier
} from './assit';
import { formatMoney, sum2array } from './format';
import { 
	compose, 
	debounce,
	canIUse,
	wxVersionUpgradeGuide,
	createLogger
} from './other';

export const Utils = {
	getUid,
	preZero,
	def,
	isObj,
	hasOwn,
	cloneDeep,
	cloneDeepEasier,
	formatMoney,
	sum2array,
	compose,
	debounce,
	canIUse,
	wxVersionUpgradeGuide,
	createLogger,
	/**
	 * 扩展或重写
	 */
	set(key, method) {
		if (typeof key === 'string') {
			this[key] = method;
		} else if (typeof key === 'object') {
			let target = key;
			for (let _ in target) {
				this[_] = target[_];
			}
		}
	}
};