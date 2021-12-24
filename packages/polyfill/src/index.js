let ready = false;

(() => {
	if (ready) return;
	let roots = [
		typeof global !== 'undefined' && global,
		typeof window !== 'undefined' && window,
		typeof self !== 'undefined' && self,
		typeof this !== 'undefined' && this,
		typeof wx !== 'undefined' && wx,
		typeof tt !== 'undefined' && tt
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
		clearInterval,
		// tt下没有
		nextTick: setTimeout
	};
		
	roots.forEach((root) => {
		root && Object.keys(originals).forEach((key) => {

			
			if (!root[key]) {
				try {
					root[key] = originals[key];
				} catch (e) {
					Object.defineProperty(root, key, {
						value: originals[key]
					});
				}
			}
		});
	});

	ready = true;
})();