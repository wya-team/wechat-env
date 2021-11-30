const { prompt, Separator } = require('inquirer');
const upath = require('upath');
const chalk = require('chalk');
const fs = require('fs-extra');

const { resolve, join } = require('path');
const tpl = require('./templates/index');
const rootTpl = require('./templates/root/index');
const formTpl = require('./templates/form/index');
const scrollTpl = require('./templates/scroll/index');

const log = console.log;
const { writeFile } = fs;

module.exports = (opts = {}) => {
	let {
		path,
		dir,
		project,
		template,
		packageName,
		pagingMode,
		pagingType,
		store = false,
		extra = '',
		title = '',
		components,
		force
	} = opts;

	const hasStore = /(scroll)/.test(template) || store;
	// 是否在子包内创建
	const isSubPackage = packageName !== 'pages';

	// home/main -> /home/main
	if (path[0] !== '/') {
		path = `/${path}`;
	}

	// /home/main/list -> /home/main-list
	let $path = path.split('/');
	if ($path.length > 3) {
		$path.splice(2, $path.length - 2, $path.slice(2).join('-'));
		path = $path.join('/');
	}

	// /pages/home/main -> /home/main
	const regex = new RegExp(`^\\/?${isSubPackage ? `${packageName}/pages` : 'pages'}`);
	if (regex.test(path)) {
		path = path.replace(regex, '');
	} 

	let pathArr = path.replace(/\({0,}\//g, '#')
		.replace(/([a-z\dA-Z])([A-Z])/g, '$1#$2')
		.toLowerCase()
		.split('#')
		.filter(item => item && !item.includes(':'));

	// 路由temp
	let route = path;
	// 0
	if (pathArr.length === 0) return;
	// 1
	if (pathArr.length === 1) {
		pathArr[1] = 'main';
		route = `${path}/main`;
	}

	/**
	 * container mutation reducer component
	 */
	let mutation = pathArr[0];
	let module = pathArr.slice(1).join('-');

	const packagePath = isSubPackage ? `${packageName}/` : '';
	let basicConfig = {
		page: {
			path: upath.normalize(`${dir}${packagePath}pages/${pathArr[0]}/${module}.wya`)
		},
		api: {
			path: upath.normalize(`${dir}${packagePath}stores/apis/${pathArr[0]}.js`)
		}
	};
	const isExist = fs.existsSync(join(basicConfig.page.path));
	// 如果页面文件已经存在，则认为已经创建，则不重新创建，否则可能会将工作区已修改的代码覆盖掉
	if (isExist) {
		log(chalk`{rgb(30,144,255) ${isSubPackage ? packageName + '/pages' : packageName}${route} already exists, skipped.}`);
		return;
	}

	if (hasStore) {
		basicConfig = {
			...basicConfig,
			module: {
				path: upath.normalize(`${dir}${packagePath}stores/modules/${pathArr[0]}/${module}.js`)
			},
			rootModule: {
				path: upath.normalize(`${dir}${packagePath}stores/modules/${pathArr[0]}/root.js`)
			}
		};
	}

	let rootConfig = {
		rootApi: {
			path: upath.normalize(`${dir}${packagePath}stores/apis/root.js`)
		},
		rootApp: {
			path: upath.normalize(`${dir}app.json`)
		}
	};

	if (hasStore) {
		rootConfig = {
			...rootConfig,
			rootModules: {
				path: upath.normalize(`${dir}${packagePath}stores/modules/root.js`)
			}
		};
	}

	if (isSubPackage) {
		rootConfig = {
			...rootConfig,
			rootStore: {
				path: upath.normalize(`${dir}${packagePath}stores/root.js`)
			},
			rootEntry: {
				path: upath.normalize(`${dir}${packagePath}/index.js`)
			}
		};
	}

	let formConfig = {
		page: basicConfig.page,
	};

	let scrollConfig = {
		// mutation: basicConfig.mutation,
		page: basicConfig.page,
		item: {
			path: upath.normalize(`${dir}${packagePath}/components/${pathArr[0]}/${module}/item.wya`)
		},
		api: basicConfig.api,
		module: basicConfig.module,
	};

	// log
	Object.keys(basicConfig).forEach(key => log(chalk`{green ${key}}: {rgb(255,131,0) ${basicConfig[key].path}}`));

	let question = {
		type: 'confirm',
		name: 'sure',
		message: 'Please make sure ~',
		default: false
	};
	let fn = () => {
		log(chalk('waiting...'));

		Object.keys(basicConfig).forEach(key => {
			let { path } = basicConfig[key];
			let fullpath = join(path);

			let content = '';
			content += `/**\n`;
			content += ` * 请注释相关信息\n`;
			content += ` */`;
			if (!fs.existsSync(fullpath)) {
				// 文件不存在的情况下操作
				log(chalk`{green ${key}}: {rgb(255,131,0) created}`);
				fs.outputFileSync(
					fullpath,
					typeof tpl[key] === 'function'
						? tpl[key]({ mutation, route, pathArr, project, packageName, module, extra, title, store })
						: content
				);
			} else if (typeof tpl[`${key}Override`] === 'function') {
				// 文件存在，重写相关
				log(chalk`{yellow ${key}}: {rgb(255,131,0) override}`);
				fs.outputFileSync(
					fullpath,
					tpl[`${key}Override`](
						fs.readFileSync(fullpath, 'utf-8'),
						{ mutation, route, pathArr, project, packageName, module, extra, title, store }
					)
				);
			}
		});

		Object.keys(rootConfig).forEach(key => {
			let { path } = rootConfig[key];
			let _key = key.replace(/_/g, '');

			let fullpath = join(path);

			if (!fs.existsSync(fullpath) && typeof rootTpl[`${_key}Initial`] === 'function') {
				fs.outputFileSync(
					fullpath,
					rootTpl[`${_key}Initial`]()
				);
			}

			if (fs.existsSync(fullpath) && typeof rootTpl[_key] === 'function') {
				// 文件存在，重写相关
				log(chalk`{yellow ${key}}: {rgb(255,131,0) override}`);

				fs.outputFileSync(
					fullpath,
					rootTpl[_key](
						fs.readFileSync(fullpath, 'utf-8'),
						{ mutation, pathArr, project, packageName, module, extra, title, route, store }
					)
				);
			}
		});

		if (template === 'scroll') {
			fs.removeSync(scrollConfig.page.path);

			Object.keys(scrollConfig).forEach(key => {
				let { path } = scrollConfig[key];
				let fullpath = join(path);
				if (typeof scrollTpl[key] === 'function') {
					log(chalk`{yellow ${key}}: {rgb(255,131,0) ${fs.existsSync(fullpath) ? 'override' : 'created'}}`);

					fs.outputFileSync(
						fullpath,
						scrollTpl[key](
							fs.existsSync(fullpath) ? fs.readFileSync(fullpath, 'utf-8') : '',
							{ mutation, pathArr, project, packageName, module, pagingType, extra, title, route, store }
						)
					);
					
				}
			});
		}
		if (template === 'form') {
			fs.removeSync(formConfig.page.path);

			Object.keys(formConfig).forEach(key => {
				let { path } = formConfig[key];
				let fullpath = join(path);
				if (typeof formTpl[key] === 'function') {
					log(chalk`{yellow ${key}}: {rgb(255,131,0) ${fs.existsSync(fullpath) ? 'override' : 'created'}}`);

					fs.outputFileSync(
						fullpath,
						formTpl[key](
							fs.existsSync(fullpath) ? fs.readFileSync(fullpath, 'utf-8') : '',
							{ mutation, pathArr, project, packageName, module, extra, title, store }
						)
					);
					
				}
			});
		}
	};
	return force 
		? fn()
		: prompt(question)
			.then((res) => {
				if (!res.sure) return null;
				fn();
			})
			.catch(e => {
				log(chalk`{red ${e}}`);
			});
};
