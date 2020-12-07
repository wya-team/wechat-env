exports.getNewContent = (opts = {}) => {
	let {
		content,
		importContent,
		injectContent,
		importSplit,
		injectSplit
	} = opts;

	try {
		if (content.substr(-1) !== '\n') {
			content += '\n';
		}
		let before = '';
		let after = '';
		let _content = '';

		if (importSplit && importContent) {
			_content = content.split(importSplit);

			before = _content[0];
			after = _content[1];

			// import
			if (before && before.includes(importContent) === false) {
				before += `${importContent}\n`;
			}
		} else {
			after = content;
		}
		
		// inject
		let _after = after.split(injectSplit);
		if (_after.length > 1 && _after[0].includes(injectContent) === false) {
			let tag = '';
			if (_after[0].substr(-1) === ',') {
				tag = `\n`;
			} else if (_after[0].substr(-2) === ',\n') {
				tag = '';
			} else {
				tag = ",\n";
			}
			_after[0] += `${tag}${injectContent}`;
		}

		after = _after.slice(1).reduce((pre, cur) => pre + injectSplit + cur, _after[0]);

		if (importSplit && importContent) {
			return _content.slice(2).reduce((pre, cur) => pre + importSplit + cur, before + importSplit + after);
		} else {
			return after;
		}
		// 返回
		
	} catch (e) {
		console.log('e', e);
		return content;
	}
};

/**
 * /test/for -> ['' , 'test', 'for'] -> For
 */
exports.getExtra = (pathArr) => {
	return pathArr.slice(1).map(item => {
		return item.split('-').map((it) => `${it[0].toUpperCase()}${it.slice(1)}`).join('');
	}).join('');
};

const getPathArrByPackage = (pathArr, packageName) => {
	const arr = [...pathArr];
	if (packageName !== 'pages') {
		const extra = packageName.split('-');
		extra.reverse().forEach(item => {
			item && arr.unshift(item);
		});
	}
	return arr;
};

/**
 * /test/for -> TEST_FOR_GET,
 * /a-sub/test/for -> A_SUB_TEST_FOR_GET,
 */
exports.getMutationType = (pathArr, packageName) => {
	const arr = getPathArrByPackage(pathArr, packageName);
	return arr.join('_').replace(/-/g, '_').toUpperCase();
};

/**
 * /test/for -> testFor,
 * /a-sub/test/for -> aSubTestfor,
 */
exports.getStoreKey = (pathArr, packageName) => {
	const arr = getPathArrByPackage(pathArr, packageName);

	return arr
		.map(
			(item, index) => {
				if (item && index != 0) {
					return item.charAt(0).toUpperCase() + item.slice(1);
				}
				return item;
			}
		)
		.join('');
};