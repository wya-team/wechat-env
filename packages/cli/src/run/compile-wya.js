const path = require('path');
const upath = require('upath');
const fs = require('fs-extra');
const del = require('del');
const through = require('through2');
const chalk = require('chalk');
const createHtmlDom = require('htmldom');
const sass = require('node-sass');
const babel = require('@babel/core');
const { babelConfig } = require('./babel-config');
const compileTemplate = require('./compile-template');
const platform = require('./platform');

let { resolve, dirname } = path;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
src = upath.normalize(src);
dist = upath.normalize(dist);

module.exports = (options) => {
	let { from, to } = options;
	from = upath.normalize(from);
	to = upath.normalize(to);
	return through.obj(function (file, enc, cb) {
		try {
			// 如果文件为空，不做任何操作，转入下一个操作，即下一个 .pipe()
			if (file.isNull()) {
				this.push(file);
				return cb();
			}

			// 插件不支持对 Stream 对直接操作，跑出异常, 异常进程
			if (file.isStream()) {
				this.emit('error', 'mp-cli/wya: 不支持Stream');
				return cb();
			}

			let content = file.contents.toString();
			if (!content) {
				content = `
					<template>
						<view></view>
					</template>
					<script>Component({})</script>
					<style lang="scss"></style>
					<config>{}</config>
				`;
			}

			let $ = createHtmlDom(content);

			content = {
				style: $('style').html(),
				template: $('template').html(),
				script: $('script').html(),
				config: $('config').html()
			};

			let write = (ext, data) => {
				let regex = new RegExp(from);
				let fullpath = upath
					.normalize(file.path)
					.replace(regex, to)
					.replace(/\.wya$/, `.${ext}`);

				if (!fullpath.includes(to)) {
					throw new Error('路径解析错误');
				}

				fullpath = resolve(fullpath);

				if (fs.existsSync(fullpath) && data === fs.readFileSync(fullpath, 'utf-8')) {
					return;
				}
				/**
				 * http://nodejs.cn/api/fs.html#fs_file_system_flags
				 * 修改文件而不是覆盖文件，则 flag 选项需要被设置为 'r+' 而不是默认的 'w'。
				 */
				fs.outputFileSync(fullpath, data, {
					flags: 'r+'
				});
			};
			// script
			babel.transform(
				content.script,
				{
					...babelConfig({ from, to }),
					filename: file.path
				}, 
				(err, result) => {
					if (err) {
						throw err;
					}
					write('js', result.code);
				}
			);

			// json
			content.config && write('json', content.config);

			// template
			write(
				platform.template, 
				compileTemplate.transform(content.template)
			);

			// style
			let imports = '';
			let regex = new RegExp(`\\.(${platform.styles.join("|")})$`);
			let { css } = sass.renderSync({
				data: content.style || ' ',
				file: file.path,
				importer(url, prev, done) {
					let fullpath = resolve(dirname(prev), url);
					// 如果本身是wxss文件, 编译后不将其包含进来。
					if (
						!fs.existsSync(fullpath) 
						|| (
							platform.styles
								.filter(i => i != 'scss')
								.some(i => url.includes(`.${i}`))
						)
					) {
						imports += `@import '${upath.normalize(url.replace(regex, `.${platform.style}`))}';\n`;
						return {
							file: fullpath, 
							contents: ``
						};
					}
					
				}
			});

			// style
			write(platform.style, imports + css);
		} catch (e) {
			console.log(e);
		}

		// this.push(file);
		cb();
	});
};