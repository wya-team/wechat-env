let targets = {
	...require('./api'),
	...require('./module'),
	...require('./mutation'),
	...require('./page'),
	...require('./item'),
};

Object.keys(targets).forEach((key) => {
	exports[key] = targets[key];
});