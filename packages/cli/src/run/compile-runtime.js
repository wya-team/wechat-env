const path = require('path');
const upath = require('upath');
const fs = require('fs-extra');
const del = require('del');
const through = require('through2');

const { rollup } = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const nodeResolve = require('@rollup/plugin-node-resolve');
const alias = require('@rollup/plugin-alias');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const { replacePlugins } = require('./babel-config');

let { resolve, dirname, parse } = path;
let __cwd = process.env.SOURCE_DIR;
let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
let temp = process.env.TEMP_DIR;

let hasRegenerator = fs.pathExistsSync(resolve(__cwd, './node_modules/regenerator-runtime'))
	|| fs.pathExistsSync(resolve(__cwd, '../node_modules/regenerator-runtime'));
	
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

		const { base, dir } = parse(file.path);
		const relativePath = upath.normalize(dir)
			.replace(new RegExp(upath.normalize(temp)), '');

		rollup({
			input: file.path,
			plugins: [
				// 是否存在
				hasRegenerator && alias({
					entries: [{
						find: /^@babel\/runtime\/regenerator$/, 
						replacement: 'regenerator-runtime'
					}]
				}),
				nodeResolve(),
				commonjs({}), 
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
					preventAssignment: false
				}),
				babel({
					babelHelpers: 'inline',
					compact: false,
					plugins: [].concat(replacePlugins)
				}),
				process.env.NODE_ENV === 'production' && terser()
			]
		}).then((minJS) => {
			return minJS.write({
				output: {
					file: `${dist}${relativePath}/libs/${base}`,
					format: 'cjs',
					exports: 'named'
				}
			});
		}).then(() => {
			cb();
		}).catch(res => {
			console.log(res);
		});
	});
};
