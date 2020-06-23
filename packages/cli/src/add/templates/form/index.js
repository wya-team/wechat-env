let targets = {
	...require('./page'),
};

Object.keys(targets).forEach((key) => {
	exports[key] = targets[key];
});