const path = require('path');
const upath = require('upath');
const del = require('del');
const fs = require('fs-extra');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const babelConfig = require('./babel-config');
const compileWya = require('./compile-wya');
const compileJSON = require('./compile-json');
const compileRuntime = require('./compile-runtime');
sass.compiler = require('node-sass');

let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;
let temp = process.env.TEMP_DIR;

console.log(`ENTRY: ${src}\nOUTPUT: ${dist}\nTEMP: ${temp}\n${process.env.NODE_ENV}`);

let entryConfig = null;
let getEntryConfig = () => {
	if (entryConfig) return entryConfig;
	let modules = (process.env.IGNORE_MODULES || '').split(',');
	let ignore = modules.filter(i => !!i).map(i => `${src}/pages/${i}/**/**`);

	entryConfig = {
		ignore: ignore.length ? ignore : undefined
	};

	return entryConfig;
};

const u = v => upath.normalize(v);
class Compiler {

	static runtime = () => {
		return gulp
			.src(u(`${temp}/**/*.js`))
			.pipe(compileRuntime());
	}

	static wya = () => {
		return gulp
			.src(u(`${src}/**/*.wya`), getEntryConfig())
			.pipe(compileWya());
	}

	static sass = () => {
		return gulp
			.src(u(`${src}/**/*.{wxss,scss}`), getEntryConfig())
			.pipe(sass().on('error', sass.logError))
			.pipe(rename({ extname: '.wxss' }))
			.pipe(gulp.dest(dist));
	}

	static js = () => {
		return gulp
			.src(u(`${src}/**/*.js`), getEntryConfig())
			.pipe(babel(babelConfig()))
			.pipe(gulp.dest(dist));
	}

	static wxml = () => {
		return gulp
			.src(u(`${src}/**/*.wxml`), getEntryConfig())
			.pipe(gulp.dest(dist));
	}

	static wxs = () => {
		return gulp
			.src(u(`${src}/**/*.wxs`), getEntryConfig())
			.pipe(babel(babelConfig({ runtimeHelpers: false })))
			.pipe(rename({ extname: '.wxs' }))
			.pipe(gulp.dest(dist));
	}

	static json = () => {
		return gulp
			.src(u(`${src}/**/*.json`), getEntryConfig())
			.pipe(compileJSON())
			.pipe(gulp.dest(dist));
	}

	static image = () => {
		return gulp
			.src(u(`${src}/**/*.{png,jpg,gif,ico,jpeg}`))
			.pipe(gulp.dest(dist));
	}

	static cleaner = () => {
		return del([u(`${dist}/**`)], { force: true });
	}

	static wyaCleaner = () => {
		return del([u(`${dist}/**/*.wya`)], { force: true });
	}
}
// build task
exports.build = gulp.series(
	Compiler.cleaner,
	gulp.parallel(
		Compiler.wya,
		Compiler.sass,
		Compiler.js,
		Compiler.wxml,
		Compiler.wxs,
		Compiler.json,
		Compiler.image,
	),
	Compiler.runtime,
);

// dev task
exports.dev = gulp.series(
	Compiler.cleaner,
	gulp.parallel(
		Compiler.wya,
		Compiler.sass,
		Compiler.js,
		Compiler.wxml,
		Compiler.wxs,
		Compiler.json,
		Compiler.image,
		() => {
			gulp.watch(u(`${src}/**/*.wya`), Compiler.wya); // watch默认会输出一个wya格式的代码
			gulp.watch(u(`${src}/**/*.js`), Compiler.js);
			gulp.watch(u(`${src}/**/*.{wxss,scss}`), Compiler.sass);
			gulp.watch(u(`${src}/**/*.wxml`), Compiler.wxml);
			gulp.watch(u(`${src}/**/*.wxs`), Compiler.wxs);
			gulp.watch(u(`${src}/**/*.json`), Compiler.json);
			gulp.watch(u(`${src}/**/*.{png,jpg,gif,ico,jpeg}`), Compiler.image);
			gulp.watch(u(`${temp}/**/*.js`), Compiler.runtime);
		}
	),
	Compiler.runtime
);
