const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs-extra');
const { prompt, Separator } = require('inquirer');
const { exec } = require('child_process');

const gulpConfig = path.resolve(__dirname, './compiler.js');

class DevProcess extends EventEmitter {
	constructor(parent) {
		super();
		process.env.NODE_ENV = 'development';
		this.$parent = parent;
	}

	getAllModules() {
		const modules = [];
		const directory = path.resolve(this.$parent.entryDir, './pages');
		fs.readdirSync(directory).forEach((file) => {
			const fullpath = path.resolve(directory, file);
			// 获取文件信息
			const stat = fs.statSync(fullpath);
			if (!['tpl'].includes(file) && stat.isDirectory()) {
				modules.push(file);
			}
		});

		return modules;
	}

	prompt() {
		let modules = this.getAllModules();
		return new Promise((resolve, reject) => {
			prompt([
				{
					type: 'list',
					name: 'isSelectAll',
					message: 'Select all modules:',
					choices: [modules.join(','), 'no']
				},
				{
					type: 'checkbox',
					name: 'modules',
					when: (answers) => answers.isSelectAll === 'no',
					message: 'Select modules:',
					pageSize: modules.length + 1,
					choices: modules,
					validate(answer) {
						if (answer.length < 1) {
							return '至少选择一个模块, 使用Space键选中';
						}
						return true;
					}
				}
			]).then((result) => {
				let { isSelectAll, modules = [] } = result;
				let allModules = this.getAllModules();

				let ignore;
				if (result.isSelectAll === 'no') {
					ignore = allModules.filter((i) => !modules.includes(i));
				} else {
					ignore = [];
				}
				
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
		let $process = exec(`npx gulp -f ${gulpConfig} dev --color`);

		$process.stdout.on('data', stdout => console.info(stdout));
		$process.stderr.on('data', stderr => console.info(stderr));
	}
}

module.exports = DevProcess;