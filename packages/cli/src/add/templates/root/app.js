const { getNewContent } = require('../utils/helper');

exports.rootApp = (content, opts = {}) => {
	const { mutation, pathArr, project, packageName, obj, route } = opts;

	const config = JSON.parse(content);
	const pages = config.pages || [];
	if (!config.subpackages) {
		config.subpackages = [];
	}
	const subpackages = config.subpackages;
	if (packageName === 'pages') {
		const page = `pages${route}`;
		const isExist = pages.some((it) => it === page);
		if (!isExist) {
			config.pages.push(page);
		} 
	} else {
		const targetIndex = subpackages.findIndex((it) => it.root === packageName);
		const targetPackage = subpackages[targetIndex];
		const targetPages = (targetPackage || {}).pages || [];
		const page = `pages${route}`;
		const isExist = targetPages.some((it) => it === page);
		if (!isExist) {
			targetPages.push(page);
		} 
		if (targetIndex === -1) {
			config.subpackages.push({
				root: packageName,
				pages: targetPages
			});
		} else {
			config.subpackages[targetIndex].pages = targetPages;
		}
	}
	
	return JSON.stringify(config, null, "\t");
};

