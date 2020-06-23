let targets = {
	...require('./api'),
	...require('./app'),
	...require('./modules'),
};

Object.keys(targets).forEach((key) => {
	exports[key] = targets[key];
});