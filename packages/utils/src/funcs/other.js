export const compose = (...funcs) => {
	if (funcs.length === 0) {
		return arg => arg;
	}
	if (funcs.length === 1) {
		return funcs[0];
	}
	return funcs.reduce((a, b) => (...args) => a(b(...args)));
};

export const debounce = (original, wait, opts = {}) => {
	const { leading, trailing, throttle } = opts;
	let timer;
	let invoke;

	let cancel = () => {
		timer && clearTimeout(timer);
		timer = null;
	};

	let start = () => {
		timer = setTimeout(() => {
			timer = null;
			trailing && invoke && invoke();
		}, wait);
	};
	const fn = (...args) => {
		invoke = () => {
			original(...args);
			invoke = null;
		};
		if (!wait && throttle) return invoke();
		if (!timer) {
			leading && invoke();
			start();
		} else if (!throttle) {
			cancel();
			start();
		}
	};

	fn.cancel = () => {
		cancel();
		invoke = null;
	};
	fn.flush = () => {
		cancel();
		trailing && invoke && invoke();
	};

	return fn;
};

/**
 * 微信版本较低导致某些API不支持时，引导升级版本
 */
export const wxVersionUpgradeGuide = () => {
	wx.showModal({
		title: '温馨提示',
		content: '您当前的微信版本过低，请升级最新版本以获得更优体验~',
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
	!ok && guide && wxVersionUpgradeGuide();
	return ok;
};

/**
 * console.log prettier
 * @param {*} trigger 
 */
export const createLogger = (trigger, color = '#1890ff') => {
	return (...args) => console.log(`%c [${trigger}]`, `color: ${color}; font-weight: bold`, ...args);
};