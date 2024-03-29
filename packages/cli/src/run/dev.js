const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs-extra');
const { prompt, Separator, registerPrompt } = require('inquirer');
const { exec } = require('child_process');

const gulpConfig = path.resolve(__dirname, './compiler.js');

registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

class DevProcess extends EventEmitter {
	constructor(parent) {
		super();
		
		this.$parent = parent;
	}

	getAllModules() {
		let configs = require(path.resolve(this.$parent.entryDir, './app.json')); // eslint-disable-line
		let packages = [''];
		if (
			configs.subpackages 
			&& configs.subpackages.length > 0
		) {
			configs.subpackages.forEach((item, index) => {
				packages.push(`${item.root}`);
			});
		}
		const result = [];

		packages.forEach($package => {
			let directory = path.resolve(this.$parent.entryDir, `./${$package}`, './pages');
			let current = {
				package: $package || '',
				modules: []
			};
			fs.readdirSync(directory).forEach((file) => {
				const fullpath = path.resolve(directory, file);
				// 获取文件信息
				const stat = fs.statSync(fullpath);
				if (!['tpl'].includes(file) && stat.isDirectory()) {
					current.modules.push(file);
				}
			});

			result.push(current);
		});

		return result;
	}

	prompt() {
		let allModules = this.getAllModules();
		return new Promise((resolve, reject) => {
			prompt([
				{
					type: 'list',
					name: 'platform',
					message: 'Select platform:',
					when: () => !process.env.PLATFORM,
					choices: [
						new Separator(' = For platform = '),
						'wx',
						'tt'
					],
					default: 'wx'
				},
				{
					type: 'list',
					name: 'isSelectAll',
					message: 'Select all package:',
					choices: allModules.reduce((pre, cur, index, source) => {
						pre = pre.concat(cur.package || 'master');
						source.length - 1 === index && (pre = [pre.join(','), 'no']);
						return pre;
					}, [])
				},
				{
					type: 'autocomplete',
					message: 'Select module:',
					name: 'module',
					// suggestOnly: true, 开启后可以验证数据且需要使用tab选中
					default: 'multiple',
					when: (answers) => answers.isSelectAll === 'no',
					source: (answers, input) => {
						input = input || '';
						return new Promise((resolve => {
							let choices = allModules.reduce((pre, cur, index, source) => {
								pre = pre.concat(cur.modules.map(i => `${cur.package ? `${cur.package}/` : ''}pages/${i}`));
								return pre;
							}, ['multiple']);
							let filter = input 
								? choices.filter(item => item.includes(input))
								: choices;
							resolve(filter);
						}));
					}
				},
				{
					type: 'checkbox',
					message: 'Select modules:',
					name: 'modules',
					when: (answers) => answers.module === 'multiple',
					choices: allModules.reduce((pre, cur, index, source) => {
						pre.push(new Separator(`--- ${cur.package || 'master'} ---`));
						pre = pre.concat(cur.modules.map(i => `${cur.package ? `${cur.package}/` : ''}pages/${i}`));
						return pre;
					}, []),
					validate(answer) {
						if (answer.length < 1) {
							return '至少选择一个模块, 使用Space键选中';
						}
						return true;
					}
				}
			]).then((result) => {
				let { platform, isSelectAll, modules = [], module: $module } = result;

				let ignore;
				if (result.isSelectAll === 'no') {
					
					if ($module !== 'multiple') {
						modules = [$module];
					}

					ignore = allModules
						.reduce(
							(pre, cur, index, source) => pre.concat(
								cur.modules.map(
									i => `${cur.package ? `${cur.package}/` : ''}pages/${i}`
								)
							), 
							[]
						).filter((i) => !modules.includes(i));
				} else {
					ignore = [];
				}
				
				!process.env.PLATFORM && (process.env.PLATFORM = platform);
				process.env.IGNORE_MODULES = ignore.join(',');
				resolve();
			}).catch((res) => {
				reject(res);
			});
		});
		
	}

	/**
	 * TODO
	 */
	async process() {
		await this.prompt();
		let $process = exec(`npx gulp -f ${gulpConfig} dev --color & ${this.$parent.options.npmScript}`);

		$process.stdout.on('data', stdout => console.info(stdout));
		$process.stderr.on('data', stderr => console.info(stderr));
	}
}

module.exports = DevProcess;