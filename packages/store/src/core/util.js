export const assert = (condition, msg) => {
	if (process.env.NODE_ENV !== 'production' && !condition) throw new Error(`[@wya/mp-store]: ${msg}`);
};

export const forEach = (obj, fn) => {
	Object.keys(obj).forEach(key => fn(obj[key], key));
};

export const isObject = (obj) => {
	return obj !== null && typeof obj === 'object';
};

export const unifyObjectStyle = (type, payload, options) => {
	if (isObject(type) && type.type) {
		options = payload;
		payload = type;
		type = type.type;
	}

	assert(typeof type === 'string', `commit时触发条件必填`);

	return { type, payload, options };
};