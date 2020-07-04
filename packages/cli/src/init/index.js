const { prompt, Separator } = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const upath = require('upath');
const chalk = require('chalk');

const { downloadFromGithub } = require('@wya/toolkit-utils');

const { resolve } = path;
const { log } = console;

module.exports = class InitManager {
	constructor(options = {}) {
		const defaultOptions = {
			// TODO
		};
		this.options = { ...defaultOptions, ...options };

		this.cwd = process.cwd();
		this.sourceDir = this.options.sourceDir;

		if (this.options.config) {
			this.configDir = path.resolve(this.options.config);
		}
	}

	_getQuesion() {
		return [
			{
				type: 'input',
				name: 'project',
				message: 'Project name:',
				validate(val) {
					if (val !== '') {
						return true;
					}
					return 'Project name is required!';
				}
			},
			{
				type: 'input',
				name: 'place',
				message: 'Where to init the project:',
				default: process.cwd()
			},
			{
				type: 'list',
				name: 'branch',
				message: 'Select branch:',
				// 可提供分支
				choices: [
					'master', 
				],
				validate(val) {
					if (val !== '') {
						return true;
					}
					return 'branch is required!';
				}
			}
		];
	}

	/**
	 * 用于准备当前应用程序上下文的异步方法
	 * 其中包含加载页面和插件、应用插件等。
	 */
	async process() {
		prompt(this._getQuesion())
			.then((opts = {}) => {
				// options
				let { project, place, branch } = opts;
				
				let options = {
					owner: 'wya-team',
					repo: 'wechat-env',
					ref: branch || 'master',
					path: 'templates',
					dest: `${place}/${project}`
				};
				log(chalk`{yellow ${JSON.stringify(options, null, '\t')}}`);
				downloadFromGithub(options);
			})
			.catch(e => {
				log(chalk`{red ${e}}`);
			});
	}
};

