export * from '@wya/mp-utils';

import { Utils } from '@wya/mp-utils';


const formatNumber = n => {
	n = n.toString();
	return n[1] ? n : '0' + n;
};

export const formatTime = date => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

export const rgba2hex = orig => {
	let a; 
	let isPercent;
	let rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
	let alpha = (rgb && rgb[4] || "").trim();
	let hex = rgb
		? (rgb[1] | 1 << 8).toString(16).slice(1)
		+ (rgb[2] | 1 << 8).toString(16).slice(1)
		+ (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

	if (alpha !== "") {
		a = alpha;
	} else {
		a = 1;
	}
	// multiply before convert to HEX
	a = ((a * 255) | 1 << 8).toString(16).slice(1);
	hex = hex + a;

	return hex;
};

export const decodeScene = (scene = '') => {
	let array = scene.split('&');
	let query = {};
	for (let i = 0; i < array.length; i++) {
		const str = array[i];
		let [key, value] = str.split('=');
		query[key] = Number(value) || value;
	}
	return query;
};

export const createSchedule = (opts = {}) => {
	const { msg = '进程超时，请先检查网络', delay = 5 } = opts; 
	let result = {};
	let ready;
	let timer;
	result.target = new Promise((resolve, reject) => {
		result.complete = (res) => {
			resolve(res);
			result.timer && clearTimeout(result.timer);
		};

		/**
		 * 超时登录这里使用reject
		 */
		result.timer = setTimeout(() => reject({ msg }), delay * 1000); // eslint-disable-line
	});
	return result;
};

// 不支持Function
export const isEqualWith = (a, b) => {
	let aProps = Object.getOwnPropertyNames(a);
	let bProps = Object.getOwnPropertyNames(b);
	if (aProps.length != bProps.length) {
		return false;
	}
	for (let i = 0; i < aProps.length; i++) {
		let propName = aProps[i];

		let propA = a[propName];
		let propB = b[propName];
		if ((typeof (propA) === 'object') || (typeof (propB) === 'object')) {
			return isEqualWith(propA, propB);
		} else if (propA !== propB) {
			return false;
		}
	}
	return true;
};

// 分页初始数据
export const initScroll = {
	current: 0,
	total: 0,
	count: 0,
	data: []
};

export const formatMoney = (value, needDot = true, decimalsLen = 2) => {
	let symbol = '';
	let integer = '';
	let decimals = '';
	let newValue = '';
	let dot;
	let initValue = '';
	if (!value) {
		let zero = '0';
		return '0.' + zero.repeat(decimalsLen);
	}
	value = value.toString();
	if (value.indexOf(',') !== -1) {
		value = value.replace(/,/g, '');
	}
	// return value;
	
	if (Number(value) < 0) {
		symbol = '-';
		value = value.split('-')[1];
	}
	initValue = value.split('.')[0];
	if (initValue.length > 7) {
		value = initValue.substring(0, initValue.length - 4) + '.' + initValue.substring(initValue.length - 4, initValue.length - 2);
	}
	integer = value.split('.')[0].split('').reverse();
	decimals = value.split('.')[1] || '';
	dot = needDot ? ',' : '';
	for (let i = 0; i < integer.length; i++) {
		newValue += integer[i] + ((i + 1) % 3 == 0 && (i + 1) != integer.length ? dot : "");
	}

	const needlen = decimalsLen - decimals.length;
	for (let i = 0; i < needlen; i++) {
		decimals += '0';
	}

	if (initValue.length > 7) {
		return symbol + newValue.split('').reverse().join('') + '.' + decimals + 'W';
	} else {
		return symbol + newValue.split('').reverse().join('') + '.' + decimals;
	}
	
};

export const initTreeData = (obj, value, label, children) => {
	if (typeof obj === 'object') {
		return JSON.parse(
			JSON.stringify(obj)
				.replace(new RegExp(value, 'g'), 'value')
				.replace(new RegExp(label, 'g'), 'label')
				.replace(new RegExp(`children|${children}`, 'g'), 'children')
		);
	}
	console.error('参数错误');
	return [];
};

/**
 * 获取源数据
 * [value, label, children]
 * value: Number or String -> '11' == 11
 */
export const getSelectedData = (value = [], source = [], opts = {}) => {
	let label = [];
	let data = [];
	const { cascader } = opts;
	if (source.length !== 0) {
		if (source.some(i => !!i.children) || !(source[0] instanceof Array)) { // 联动
			value.reduce((pre, cur) => {
				let target = pre.find(it => it.value == cur) || {};
				data.push(target);
				label.push(target.label);
				return target.children || [];
			}, source);
		} else {
			value.forEach((item, index) => {
				let target = source[index].find(it => it.value == item);
				data.push(target);
				label.push(target.label);
			});
		}
		
	}
	return {
		value,
		label,
		data
	};
};

/**
 * console.log() prettier
 * @param {*} source 
 * @param  {...any} rest 
 */
export const logger = (source, ...rest) => {
	console.log(`%c [${source}]`, 'color: red; font-weight: bold', ...rest);
};

/**
 * 微信版本较低导致某些API不支持时，引导升级版本
 * @param {*} source 
 * @param  {...any} rest 
 */
export const lowVersionGuide = () => {
	wx.showModal({
		title: '温馨提示',
		content: '微信版本过低，请升级最新版本以获得更优体验~',
		showCancel: false,
		confirmText: '好的'
	});
};

/**
 * wx.canIUse 的一层封装，API不支持时可提示引导升级微信版本
 * @param {*} api 
 * @param {*} guide 
 * @returns 
 */
export const canIUse = (api, guide = true) => {
	const ok = wx.canIUse(api);
	if (!ok && guide) {
		lowVersionGuide();
	}
	return ok;
};

/**
 * 获取当前页面完整url
 * @returns 
 */
export const getCurrentUrl = () => {
	let { route, options = {} } = getCurrentPages().pop() || {};
	if (!route) return '';
	let query = Object.keys(options)
		.reduce((pre, cur, index) => { 
			pre += `${index == 0 ? '?' : '&'}${cur}=${options[cur]}`;
			return pre; 
		}, '');
	return encodeURIComponent(`/${route}${query}`);
};

// 方便调用
Utils.set({
	formatTime,
	createSchedule,
	decodeScene,
	rgba2hex,
	isEqualWith,
	initScroll,
	initTreeData,
	getSelectedData,
	formatMoney
});

