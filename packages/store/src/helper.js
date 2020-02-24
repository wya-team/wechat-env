let normalizeMap = (map) => {
	return Array.isArray(map)
		? map.map(key => ({ key, val: key }))
		: Object.keys(map).map(key => ({ key, val: map[key] }));
};

export const mapActions = (actions) => {
	const res = {};
	normalizeMap(actions).forEach(({ key, val }) => {
		res[key] = function (...arg) {
			let dispatch = this.$store.dispatch;
			
			return typeof val === 'function'
				? val.apply(this, [dispatch].concat(arg))
				: dispatch.apply(this.$store, [val].concat(arg));
		};
	});
	return res;
};