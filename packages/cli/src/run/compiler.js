const path = require('path');
const upath = require('upath');
const del = require('del');
const fs = require('fs-extra');
const chalk = require('chalk');
const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const { babelConfig, scriptPlugins } = require('./babel-config');
const compileWya = require('./compile-wya');
const compileJSON = require('./compile-json');
const compileTemplate = require('./compile-template');
const compileRuntime = require('./compile-runtime');
const { resolvePackage } = require('./utils');
const platform = require('./platform');

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

	static runtime = (opts = {}) => {
		const { globs = `/**/*.js`, single = {} } = opts;
		return function runtime() {
			return gulp
				.src(u(single.from || `${temp}${globs}`))
				.pipe(compileRuntime());
		};
	}

	static wya = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.wya`, single = {}, gulpOpts } = opts;
		return function wya() {
			return gulp
				.src(u(`${from}${globs}`), gulpOpts || getEntryConfig())
				.pipe(compileWya({ from, to }));
		};
	}

	static js = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.js`, single = {}, gulpOpts } = opts;
		return function js() {
			return gulp
				.src(single.from || u(`${from}${globs}`), gulpOpts || getEntryConfig())
				.pipe(babel(babelConfig({ from, to })))
				.on('error', function (e) {
					console.log('>>> ERROR', e);
					// emit here
					this.emit('end');
				})
				.pipe(gulp.dest(single.to || to));
		};
	}

	static style = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.{${platform.styles.join(',')}}`, single = {}, gulpOpts } = opts;
		return function style() {
			return gulp
				.src(u(single.from || `${from}${globs}`), gulpOpts || getEntryConfig())
				.pipe(gulpSass().on('error', gulpSass.logError))
				.pipe(rename({ extname: `.${platform.style}` }))
				.pipe(gulp.dest(single.to || to));
		};
	}

	static template = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.{${platform.templates.join(',')}}`, single = {}, gulpOpts } = opts;
		return function template() {
			return gulp
				.src(u(single.from || `${from}${globs}`), gulpOpts || getEntryConfig())
				.pipe(compileTemplate())
				.pipe(gulp.dest(single.to || to));
		};
	}

	static script = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.{${platform.scripts.join(',')}}`, single = {}, gulpOpts } = opts;

		const babelrc = babelConfig({ runtimeHelpers: false, from, to });
		babelrc.plugins = babelrc.plugins.concat(scriptPlugins);
		return function script() {
			return gulp
				.src(u(single.from || `${from}${globs}`), gulpOpts || getEntryConfig())
				.pipe(babel(babelrc))
				.pipe(rename({ extname: `.${platform.script}` }))
				.pipe(gulp.dest(single.to || to));
		};
	}

	static json = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.json`, single = {}, gulpOpts } = opts;
		return function json() {
			return gulp
				.src(u(single.from || `${from}${globs}`), gulpOpts || getEntryConfig())
				.pipe(compileJSON())
				.pipe(gulp.dest(single.to || to));
		};
	}

	static image = (opts = {}) => {
		const { from = src, to = dist, globs = `/**/*.{png,jpg,gif,ico,jpeg}`, single = {}, gulpOpts } = opts;
		return function image() {
			return gulp
				.src(u(single.from || `${from}${globs}`))
				.pipe(gulp.dest(single.to || to));
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

		if (!fs.pathExistsSync(configFile)) {
			return Promise.resolve;
		}

		// 同步文件
		let result = require(configFile); // eslint-disable-line
		let { copies = [] } = typeof result === 'function' ? result() : result;
		for (let i = 0; i < copies.length; i++) {
			let { name, from, to, enforce, options = {} } = copies[i];
			resolvePackage(name); // = 检查包是否存在

			if (enforce === 'pre') {
				// check
				const gulpOpts = {
					...options,
					ignore: options.ignore && options.ignore.length 
						? options.ignore.filter(i => !!i).map(i => {
							if (i.includes('**')) return i;
							return `${from}/${i}/**/**`;
						}) 
						: undefined,
				};

				buildsReady = buildsReady.concat([
					Compiler.wya({ from, to, gulpOpts }),
					Compiler.style({ from, to, gulpOpts }),
					Compiler.js({ from, to, gulpOpts }),
					Compiler.template({ from, to, gulpOpts }),
					Compiler.script({ from, to, gulpOpts }),
					Compiler.json({ from, to, gulpOpts }),
					Compiler.image({ from, to, gulpOpts })
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
		Compiler.style(),
		Compiler.js(),
		Compiler.template(),
		Compiler.script(),
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
		Compiler.style(),
		Compiler.js(),
		Compiler.template(),
		Compiler.script(),
		Compiler.json(),
		Compiler.image()
	),
	Compiler.runtime(),
	function watch() {
		let fn = (globs, generateTask) => {
			gulp.watch(u(globs)).on('all', (type, fullpath) => {
				fullpath = u(fullpath);
				try {
					const realPath = fullpath.replace(new RegExp(u(src), 'g'), '');
					if (type !== 'unlink') {
						const run = generateTask({ 
							single: {
								from: fullpath,
								to: path.dirname(fullpath).replace(new RegExp(u(src), 'g'), dist)
							}, 
							gulpOpts: {}
						 });

						run();
					} else {
						fs.removeSync(u(dist + realPath));
					}

					// 日志输出
					console.log(chalk`{green ${type}}: {rgb(97,174,238) ${realPath}}`);
					console.log(chalk`{green from}: {rgb(255,131,0) ${u(fullpath)}}`);
					console.log(chalk`{green to}: {rgb(255,131,0) ${u(dist + realPath)}}`);
				} catch (e) {
					console.log(e);
				}
			});
		};

		fn(`${src}/**/*.wya`, Compiler.wya);
		fn(`${src}/**/*.js`, Compiler.js);
		fn(`${src}/**/*.{${platform.styles.join(',')}}`, Compiler.style);
		fn(`${src}/**/*.{${platform.templates.join(',')}}`, Compiler.template);
		fn(`${src}/**/*.{${platform.scripts.join(',')}}`, Compiler.script);
		fn(`${src}/**/*.json`, Compiler.json);
		fn(`${src}/**/*.{png,jpg,gif,ico,jpeg}`, Compiler.image);
		fn(`${temp}/**/*.js`, Compiler.runtime);
	}
);
