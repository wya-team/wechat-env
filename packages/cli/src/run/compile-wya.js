const path = require('path');
const fs = require('fs-extra');
const del = require('del');
const through = require('through2');
const { DOMParser } = require('xmldom');
const sass = require('node-sass');
const babel = require('@babel/core');
const babelConfig = require('./babel-config');

let { resolve } = path;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;

let decode = (content) => {
	let pmap = ['<', '&', '"'];
	let amap = ['&lt;', '&amp;', '&quot;'];
	let reg = new RegExp(`(${amap[0]}|${amap[1]}|${amap[2]})`, 'ig');
	return content.replace(reg, (match, m) => {
		return pmap[amap.indexOf(m)];
	});
};

module.exports = (options) => {
	return through.obj(function (file, enc, cb) {

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
		let parser = new DOMParser({
			locator: {},
			errorHandler: {
				warning(x) {
					console.warning(x);
				},
				error(x) {
					console.error(x);
				}
			}
		});

		let xml = parser.parseFromString(content);
		let opath = path.parse(file.path);
		let rst = {
			moduleId: file.path,
			style: [],
			template: {
				code: '',
				src: '',
				type: '',
			},
			script: {
				code: '',
				src: '',
				type: ''
			},
			config: {
				code: '',
				src: '',
				type: ''
			}
		};

		[].slice.call(xml.childNodes || []).forEach((child) => {
			const nodeName = child.nodeName;
			if (nodeName === 'style' || nodeName === 'template' || nodeName === 'script' || nodeName === 'config') {
				let rstTypeObj;

				if (nodeName === 'style') {
					rstTypeObj = { code: '' };
					rst[nodeName].push(rstTypeObj);
				} else {
					rstTypeObj = rst[nodeName];
				}

				// rstTypeObj.src = child.getAttribute('src');
				[].slice.call(child.childNodes || []).forEach((c) => {
					rstTypeObj.code += decode(c.toString());
				});
			}
		});

		let fn = (ext) => {
			let regex = new RegExp(src);
			return file.path.replace(regex, dist).replace(/.wya/, `.${ext}`);
		};
		// script
		babel.transform(
			rst.script.code,
			babelConfig, 
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
		fs.outputFileSync(
			fn('json'), 
			rst.config.code,
		);

		// template
		fs.outputFileSync(
			fn('wxml'),
			rst.template.code,
		);

		// style
		fs.outputFileSync(
			fn('wxss'),
			rst.style.map(i => {
				let result = sass.renderSync({
					data: i.code,
					file: file.path
				});
				return result.css;
			}).join('\n')
		);

		fs.outputFileSync(
			fn('wxss'),
			rst.style.map(i => {
				let result = sass.renderSync({
					data: i.code,
					file: file.path
				});
				return result.css;
			}).join('\n')
		);
		// this.push(file);
		// cb();
	});
};