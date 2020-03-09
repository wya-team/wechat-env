const path = require('path');
const upath = require('upath');
const fs = require('fs-extra');
const del = require('del');
const through = require('through2');
const createHtmlDom = require('htmldom');
const sass = require('node-sass');
const babel = require('@babel/core');
const babelConfig = require('./babel-config');

let { resolve, dirname } = path;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
src = upath.normalize(src);
dist = upath.normalize(dist);

module.exports = (options) => {
	return through.obj(function (file, enc, cb) {

		try {
			// 如果文件为空，不做任何操作，转入下一个操作，即下一个 .pipe()
			if (file.isNull()) {
				this.push(file);
				return cb();
			}

			// 插件不支持对 Stream 对直接操作，跑出异常
			if (file.isStream()) {
				this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
				return cb();
			}

			let content = file.contents.toString();
			let $ = createHtmlDom(content);

			content = {
				style: $('style').html(),
				template: $('template').html(),
				script: $('script').html(),
				config: $('config').html()
			};

			let fn = (ext) => {
				let regex = new RegExp(src);
				let fullpath = upath
					.normalize(file.path)
					.replace(regex, dist)
					.replace(/\.wya$/, `.${ext}`);

				if (!fullpath.includes(dist)) {
					throw new Error('路径解析错误');
				}

				return resolve(fullpath);
			};
			// script
			babel.transform(
				content.script,
				{
					...babelConfig,
					filename: file.path
				}, 
				(err, result) => {
					if (err) {
						throw err;
					}
					fs.outputFileSync(
						fn('js'), 
						result.code
					);
				}
			);

			// json
			content.config && fs.outputFileSync(
				fn('json'), 
				content.config,
			);

			// template
			fs.outputFileSync(
				fn('wxml'),
				content.template,
			);

			// style
			let imports = '';
			let { css } = sass.renderSync({
				data: content.style || ' ',
				file: file.path,
				importer(url, prev, done) {
					let fullpath = resolve(dirname(prev), url);
					// 如果本身是wxss文件, 编译后不将其包含进来。
					if (!fs.existsSync(fullpath) || url.includes('.wxss')) {
						imports += `@import '${upath.normalize(url.replace(/\.scss$/, '.wxss'))}';\n`;
						return {
							file: fullpath, 
							contents: ``
						};
					}
					
				}
			});
			// style
			fs.outputFileSync(
				fn('wxss'),
				imports + css
			);
		} catch (e) {
			console.log(e);
		}

		// this.push(file);
		cb();
	});
};