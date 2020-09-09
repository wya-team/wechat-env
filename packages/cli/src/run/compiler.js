const path = require('path');
const upath = require('upath');
const del = require('del');
const fs = require('fs-extra');
const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const babelConfig = require('./babel-config');
const compileWya = require('./compile-wya');
const compileJSON = require('./compile-json');
const compileRuntime = require('./compile-runtime');
const { resolvePackage } = require('./utils');
gulpSass.compiler = require('node-sass');

let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
let temp = process.env.TEMP_DIR;
let configFile = process.env.CONFIG_FILE_PATH;

console.log(`ENTRY: ${src}\nOUTPUT: ${dist}\nTEMP: ${temp}\n${process.env.NODE_ENV}`);

let entryConfig = null;
let getEntryConfig = () => {
	if (entryConfig) return entryConfig;
	let modules = (process.env.IGNORE_MODULES || '').split(',');
	let ignore = modules.filter(i => !!i).map(i => `${src}/${i}/**/**`);

	entryConfig = {
		ignore: ignore.length ? ignore : undefined
	};

	return entryConfig;
};

const u = v => upath.normalize(v);
class Compiler {

	static runtime = (from = src, to = dist) => {
		return function runtime() {
			return gulp
				.src(u(`${temp}/**/*.js`))
				.pipe(compileRuntime());
		};
	}

	static wya = (from = src, to = dist, opts) => {
		return function wya() {
			return gulp
				.src(u(`${from}/**/*.wya`), opts || getEntryConfig())
				.pipe(compileWya({ from, to }));
		};
	}

	static sass = (from = src, to = dist, opts) => {
		return function sass() {
			return gulp
				.src(u(`${from}/**/*.{wxss,scss}`), opts || getEntryConfig())
				.pipe(gulpSass().on('error', gulpSass.logError))
				.pipe(rename({ extname: '.wxss' }))
				.pipe(gulp.dest(to));
		};
	}

	static js = (from = src, to = dist, opts) => {
		return function js() {
			return gulp
				.src(u(`${from}/**/*.js`), opts || getEntryConfig())
				.pipe(babel(babelConfig({ from, to })))
				.pipe(gulp.dest(to));
		};
	}

	static wxml = (from = src, to = dist, opts) => {
		return function wxml() {
			return gulp
				.src(u(`${from}/**/*.wxml`), opts || getEntryConfig())
				.pipe(gulp.dest(to));
		};
	}

	static wxs = (from = src, to = dist, opts) => {
		return function wxs() {
			return gulp
				.src(u(`${from}/**/*.wxs`), opts || getEntryConfig())
				.pipe(babel(babelConfig({ runtimeHelpers: false, from, to })))
				.pipe(rename({ extname: '.wxs' }))
				.pipe(gulp.dest(to));
		};
	}

	static json = (from = src, to = dist, opts) => {
		return function json() {
			return gulp
				.src(u(`${from}/**/*.json`), opts || getEntryConfig())
				.pipe(compileJSON())
				.pipe(gulp.dest(to));
		};
	}

	static image = (from = src, to = dist, opts) => {
		return function image() {
			return gulp
				.src(u(`${from}/**/*.{png,jpg,gif,ico,jpeg}`))
				.pipe(gulp.dest(to));
		};
	}

	static cleaner = () => {
		return function cleaner() {
			return del([u(`${dist}/**`)], { force: true });
		};
	}

	// 预编译项
	static prebuild = () => {
		let buildsReady = [];
		let copiesReady = [];

		if (!fs.pathExistsSync(configFile)) return Promise.resolve;
		// 同步文件
		let result = require(configFile); // eslint-disable-line
		let { copies = [] } = typeof result === 'function' ? result() : result;
		for (let i = 0; i < copies.length; i++) {
			let { name, from, to, enforce, options = {} } = copies[i];
			resolvePackage(name); // = 检查包是否存在

			if (enforce === 'pre') {

				// check
				options = {
					ignore: options.ignore && options.ignore.length ? options.ignore : undefined,
					...options
				};

				buildsReady = buildsReady.concat([
					Compiler.wya(from, to, options),
					Compiler.sass(from, to, options),
					Compiler.js(from, to, options),
					Compiler.wxml(from, to, options),
					Compiler.wxs(from, to, options),
					Compiler.json(from, to, options),
					Compiler.image(from, to, options)
				]);
			} else {
				copiesReady.push(() => fs.copySync(from, to));
			}
		}	
		
		return gulp.series(
			function copies() {
				copiesReady.forEach(fn => fn());
				return Promise.resolve();
			},
			buildsReady.length > 0 
				? gulp.parallel(...buildsReady) 
				: Promise.resolve
		);
	};
}
// build task
exports.build = gulp.series(
	Compiler.cleaner(),
	Compiler.prebuild(),
	gulp.parallel(
		Compiler.wya(),
		Compiler.sass(),
		Compiler.js(),
		Compiler.wxml(),
		Compiler.wxs(),
		Compiler.json(),
		Compiler.image(),
	),
	Compiler.runtime(),
);

// dev task
exports.dev = gulp.series(
	Compiler.cleaner(),
	Compiler.prebuild(),
	gulp.parallel(
		Compiler.wya(),
		Compiler.sass(),
		Compiler.js(),
		Compiler.wxml(),
		Compiler.wxs(),
		Compiler.json(),
		Compiler.image(),
		() => {
			gulp.watch(u(`${src}/**/*.wya`), Compiler.wya()); // watch默认会输出一个wya格式的代码
			gulp.watch(u(`${src}/**/*.js`), Compiler.js());
			gulp.watch(u(`${src}/**/*.{wxss,scss}`), Compiler.sass());
			gulp.watch(u(`${src}/**/*.wxml`), Compiler.wxml());
			gulp.watch(u(`${src}/**/*.wxs`), Compiler.wxs());
			gulp.watch(u(`${src}/**/*.json`), Compiler.json());
			gulp.watch(u(`${src}/**/*.{png,jpg,gif,ico,jpeg}`), Compiler.image());
			gulp.watch(u(`${temp}/**/*.js`), Compiler.runtime());
		}
	),
	Compiler.runtime
);
