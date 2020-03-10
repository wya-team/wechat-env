const path = require('path');
const del = require('del');
const fs = require('fs-extra');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const babelConfig = require('./babel-config');
const compileWya = require('./compile-wya');
sass.compiler = require('node-sass');

let src = process.env.REPO_SOURCE_DIR;
let dist = process.env.REPO_DIST_DIR;

console.log(`ENTRY: ${src}\nOUTPUT: ${dist}`);

let ignore = () => {
	let modules = (process.env.IGNORE_MODULES || '').split(',');
	let result = modules.map(i => `${src}/${i}/**`);
	return result;
};
class Compiler {

	static wya = () => {
		return gulp
			.src(`${src}/**/*.wya`, { ignore: ignore() })
			.pipe(compileWya());
	}

	static sass = () => {
		return gulp
			.src(`${src}/**/*.{wxss,scss}`, { ignore: ignore() })
			.pipe(sass().on('error', sass.logError))
			.pipe(rename({ extname: '.wxss' }))
			.pipe(gulp.dest(dist));
	}

	static js = () => {
		return gulp
			.src(`${src}/**/*.js`, { ignore: ignore() })
			.pipe(babel(babelConfig))
			.pipe(gulp.dest(dist));
	}

	static wxml = () => {
		return gulp
			.src(`${src}/**/*.wxml`, { ignore: ignore() })
			.pipe(gulp.dest(dist));
	}

	static wxs = () => {
		return gulp
			.src(`${src}/**/*.wxs`, { ignore: ignore() })
			.pipe(babel(babelConfig))
			.pipe(rename({ extname: '.wxs' }))
			.pipe(gulp.dest(dist));
	}

	static json = () => {
		return gulp
			.src(`${src}/**/*.json`, { ignore: ignore() })
			.pipe(gulp.dest(dist));
	}

	static cleaner = () => {
		return del([`${dist}/**`], { force: true });
	}

	static wyaCleaner = () => {
		return del([`${dist}/**/*.wya`], { force: true });
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
	)
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
		() => {
			gulp.watch(`${src}/**/*.wya`, Compiler.wya); // watch默认会输出一个wya格式的代码
			gulp.watch(`${src}/**/*.js`, Compiler.js);
			gulp.watch(`${src}/**/*.{wxss,scss}`, Compiler.sass);
			gulp.watch(`${src}/**/*.wxml`, Compiler.wxml);
			gulp.watch(`${src}/**/*.wxs`, Compiler.wxs);
			gulp.watch(`${src}/**/*.json`, Compiler.json);
		}
	)
);
