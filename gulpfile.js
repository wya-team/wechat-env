const gulp = require('gulp');
const del = require('del');
const path = require('path');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const jsonminify = require('gulp-jsonminify2');
const gutil = require('gulp-util');
const combiner = require('stream-combiner2');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const minifycss = require('gulp-minify-css');
const runSequence = require('run-sequence');
const jsonlint = require("gulp-jsonlint");

let colors = gutil.colors;
const handleError = function(err) {
	console.log('\n');
	gutil.log(colors.red('Error!'));
	gutil.log('fileName: ' + colors.red(err.fileName));
	gutil.log('lineNumber: ' + colors.red(err.lineNumber));
	gutil.log('message: ' + err.message);
	gutil.log('plugin: ' + colors.yellow(err.plugin));
};

gulp.task('clean', () => {
	return del(['./dist/**']);
});

gulp.task('watch', () => {
	gulp.watch('./src/**/*.json', ['json']);
	gulp.watch('./src/assets/**', ['assets']);
	gulp.watch('./src/**/*.wxml', ['templates']);
	gulp.watch('./src/**/*.wxss', ['wxss']);
	gulp.watch('./src/**/*.sass', ['wxss']);
	gulp.watch('./src/**/*.js', ['scripts']);
});

/**
 *  json
 */
gulp.task('jsonLint', () => {
	let combined = combiner.obj([
		gulp.src(['./src/**/*.json']),
		jsonlint(),
		jsonlint.reporter(),
		jsonlint.failAfterError()
	]);

	combined.on('error', handleError);
});
gulp.task('json', ['jsonLint'], () => {
	return gulp.src('./src/**/*.json')
		.pipe(gulp.dest('./dist'));
});
gulp.task('jsonPro', ['jsonLint'], () => {
	return gulp.src('./src/**/*.json')
		.pipe(jsonminify())
		.pipe(gulp.dest('./dist'));
});

/**
 * assets
 */
gulp.task('assets', () => {
	return gulp.src('./src/assets/**')
		.pipe(gulp.dest('./dist/assets'));
});

/**
 * templates
 */
gulp.task('templates', () => {
	return gulp.src('./src/**/*.wxml')
		.pipe(gulp.dest('./dist'));
});
gulp.task('templatesPro', () => {
	return gulp.src('./src/**/*.wxml')
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true,
			keepClosingSlash: true
		}))
		.pipe(gulp.dest('./dist'));
});
/**
 * wxss
 */
gulp.task('wxss', () => {
	let combined = combiner.obj([
		gulp.src(['./src/**/*.{wxss,sass}', '!./src/styles/**']),
		sass().on('error', sass.logError),
		autoprefixer([
			'iOS >= 8',
			'Android >= 4.1'
		]),
		rename((path) => path.extname = '.wxss'),
		gulp.dest('./dist')
	]);

	combined.on('error', handleError);
});
gulp.task('wxssPro', () => {
	let combined = combiner.obj([
		gulp.src(['./src/**/*.{wxss,sass}', '!./src/styles/**']),
		sass().on('error', sass.logError),
		autoprefixer([
			'iOS >= 8',
			'Android >= 4.1'
		]),
		minifycss(),
		rename((path) => path.extname = '.wxss'),
		gulp.dest('./dist')
	]);

	combined.on('error', handleError);
});
/**
 * js
 */
gulp.task('scripts', () => {
	return gulp.src('./src/**/*.js')
		.pipe(babel({
			presets: ['es2015', 'stage-0']
		}))
		.pipe(gulp.dest('./dist'));
});
gulp.task('scriptsPro', () => {
	return gulp.src('./src/**/*.js')
		.pipe(babel({
			presets: ['es2015', 'stage-0']
		}))
		.pipe(uglify({
			compress: true,
		}))
		.pipe(gulp.dest('./dist'));
});


// dev 模式
gulp.task('dev', ['clean'], () => {
	runSequence(
		'json',
		'assets',
		'templates',
		'wxss',
		'scripts',
		'watch'
	);
});

// build 模式
gulp.task('build', [
	'jsonPro',
	'assets',
	'templatesPro',
	'wxssPro',
	'scriptsPro'
]);

gulp.task('pro', ['clean'], () => {
	runSequence('build');
});