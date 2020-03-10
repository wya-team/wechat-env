const path = require('path');
const fs = require('fs-extra');
const del = require('del');
const through = require('through2');
const babel = require('@babel/core');
const str2ast = require('@babel/template').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');


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
			this.emit('error', 'mp-cli/libs: Streaming not supported');
			return cb();
		}

		babel.transform(
			file.contents.toString(),
			{
				babelrc: true,
				plugins: [
					{
						visitor: {
							// 需要避免无限调用，只执行一次
							CallExpression(path) {
								if (path.node.callee.name === 'require') {
									let lib = path.node.arguments[0].value;
									// path.node.arguments[0].value
								}
							}
						}
					}
				]
			}, 
			(err, result) => {
				if (err) {
					throw err;
				}

				file.contents = Buffer.from(result.code);
				this.push(file);
				cb();
			}
		);

		
	});
};