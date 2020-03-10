const path = require('path');
const fs = require('fs-extra');
const del = require('del');
const through = require('through2');

let { resolve, dirname } = path;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;

let entry = resolve(src, 'app.json');

module.exports = (options) => {
	return through.obj(function (file, enc, cb) {

		// 如果文件为空，不做任何操作，转入下一个操作，即下一个 .pipe()
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		// 插件不支持对 Stream 对直接操作，跑出异常
		if (file.isStream()) {
			this.emit('error', 'mp-cli/json: Streaming not supported');
			return cb();
		}

		if (process.env.IGNORE_MODULES) {
			if (file.path === entry) {
				let regex = process.env.IGNORE_MODULES
					.split(',')
					.filter(i => !!i)
					.map(i => `/?pages/${i}/`)
					.join('|');

				regex = new RegExp(`^(${regex})`);
				
				let json = JSON.parse(file.contents.toString());

				// pages
				json.pages = json.pages.filter(i => !regex.test(i));

				// tabBar
				if (json.tabBar && json.tabBar.list) {
					json.tabBar.list = json.tabBar.list.filter(i => !regex.test(i.pagePath));
					if (json.tabBar.list.length <= 1) {
						delete json.tabBar;
					}
				}
				
				file.contents = Buffer.from(JSON.stringify(json, null, "\t"));
			}
		}
		
		this.push(file);
		cb();
	});
};