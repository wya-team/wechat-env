const path = require('path');
const del = require('del');
const fs = require('fs-extra');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const { exec } = require('child_process');
sass.compiler = require('node-sass');

const copier = (src, dist, ext) => {
	return () => gulp.src(`${src}/**/*.${ext}`).pipe(gulp.dest(dist));
};

const cleaner = dir => () => del([`${dir}/**`]);
// TODO
const r = (source) => path.resolve(process.cwd(), './node_modules', source);

class Compile {
	constructor(parent) {
		this.$parent = parent;
		this.src = parent.$parent.entryDir;
		this.dist = parent.$parent.outputDir;

		this.staticCopier = this.staticCopier.bind(this);
		this.sassCompiler = this.sassCompiler.bind(this);
		this.jsCompiler = this.jsCompiler.bind(this);
		this.wyaCompiler = this.wyaCompiler.bind(this);
	}

	wyaCompiler() {
		let { src, dist } = this;
		return () => gulp
			.src(`${src}/**/*.wya`)
			.pipe(gulp.dest(dist));
	}

	staticCopier() {
		let { src, dist } = this;
		return gulp.parallel(
			copier(src, dist, 'wxml'),
			copier(src, dist, 'wxs'),
			copier(src, dist, 'json'),
		);
	}

	sassCompiler() {
		let { src, dist } = this;
		return () => gulp
			.src(`${src}/**/*.{wxss,scss}`)
			.pipe(sass().on('error', sass.logError))
			.pipe(rename({ extname: '.wxss' }))
			.pipe(gulp.dest(dist));
	}

	jsCompiler() {
		let { src, dist } = this;
		return () => gulp
			.src(`${src}/**/*.js`)
			.pipe(babel({
				presets: [r('@babel/preset-env')],
				plugins: [
					r('@babel/plugin-proposal-export-namespace-from'),
					r('@babel/plugin-proposal-export-default-from'),
					r('@babel/plugin-proposal-function-bind'),
					r('@babel/plugin-syntax-dynamic-import'),
					[
						r('@babel/plugin-proposal-decorators'),
						{
							"legacy": true
						}
					],
					[	
						r('@babel/plugin-proposal-class-properties'),
						{
							"loose": true
						}
					]
				]
			}))
			.pipe(gulp.dest(dist));
	}

	run(opts) {
		const { watch } = opts || {};
		const { src, dist, sassCompiler, jsCompiler, staticCopier, wyaCompiler } = this;

		const runTask = !watch 
			? gulp.series(
				cleaner(dist),
				gulp.parallel(
					wyaCompiler(),
					sassCompiler(),
					jsCompiler(),
					staticCopier()
				)
			)
			: gulp.series(
				cleaner(dist),
				gulp.parallel(
					wyaCompiler(),
					sassCompiler(),
					jsCompiler(),
					staticCopier(),
					() => {
						gulp.watch(`${src}/**/*.js`, jsCompiler());
						gulp.watch(`${src}/**/*.{wxss,scss}`, sassCompiler());
						gulp.watch(`${src}/**/*.wxml`, copier(src, dist, 'wxml'));
						gulp.watch(`${src}/**/*.wxs`, copier(src, dist, 'wxs'));
						gulp.watch(`${src}/**/*.json`, copier(src, dist, 'json'));
					}
				)
			);
		runTask();
	}
}
module.exports = Compile;