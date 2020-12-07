let targets = {
	...require('./api'),
	...require('./app'),
	...require('./modules'),
	...require('./entry'),
	...require('./store'),
};

Object.keys(targets).forEach((key) => {
	exports[key] = targets[key];
});