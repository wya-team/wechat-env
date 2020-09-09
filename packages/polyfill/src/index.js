let ready = false;

(() => {
	if (ready) return;
	let roots = [
		typeof global !== 'undefined' && global,
		typeof window !== 'undefined' && window,
		typeof self !== 'undefined' && self,
		typeof this !== 'undefined' && this,
		typeof wx !== 'undefined' && wx
	];

	let originals = {
		Array,
		Date,
		Error,
		Function,
		Math,
		Object,
		RegExp,
		String,
		TypeError,
		setTimeout,
		clearTimeout,
		setInterval,
		clearInterval
	};
		
	roots.forEach((root) => {
		root && Object.keys(originals).forEach((key) => {
			if (!root[key]) root[key] = originals[key];
		});
	});

	ready = true;
})();