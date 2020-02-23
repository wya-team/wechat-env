export const getPropByPath = (obj, path) => {
	let target = obj;
	path = path.replace(/\[(\w+)\]/g, '.$1');
	path = path.replace(/^\./, '');

	let keyArr = path.split('.');
	let i = 0;

	for (let len = keyArr.length; i < len - 1; ++i) {
		let key = keyArr[i];
		if (key in target) {
			target = target[key];
		} else {
			throw new Error('[@wya/http]: please transfer a valid prop path to form item!');
		}
	}
	return {
		target,
		key: keyArr[i],
		value: target[keyArr[i]]
	};
};


export const isJson = (str) => {
	let state = false;
	try {
		if (typeof JSON.parse(str) == "object") {
			state = true;
		}
	} catch (e) {
		console.log(e);
	}
	return false;
};

/**
 * https://github.com/reduxjs/redux/blob/master/src/compose.js
 */
export const compose = (...funcs) => {
	if (funcs.length === 0) {
		return arg => arg;
	}
	if (funcs.length === 1) {
		return funcs[0];
	}
	return funcs.reduce((a, b) => (...args) => a(b(...args)));
};

export const noop = () => {};