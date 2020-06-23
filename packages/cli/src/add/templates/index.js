let targets = {
	...require('./api'),
	...require('./page'),
	...require('./mutation'),
	...require('./module'),
	...require('./rootModule'),
};

Object.keys(targets).forEach((key) => {
	exports[key] = targets[key];
});