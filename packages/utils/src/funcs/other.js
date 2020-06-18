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