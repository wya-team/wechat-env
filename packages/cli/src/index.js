const chalk = require('chalk');
const program = require('cac')();
const { resolve } = require('path');
const { Run } = require('./commands');

const { log } = console;
program
	.version(require('../package').version);

// 使用指令参数 如 mp-cli server;
program
	.usage('<cmd>');

// dev
program
	.command('dev [sourceDir]', 'development mode')
	.option('--npm-script <npmScript>', 'npm scripts', { default: "echo 'end'" })
	.action((sourceDir = '.', commandOptions) => {
		let app = new Run({
			sourceDir: resolve(sourceDir),
			...commandOptions
		});
		app.dev();
	});

// Run
program
	.command('build [sourceDir]', 'production mode')
	.action((sourceDir = '.', commandOptions) => {
		let app = new Run({
			sourceDir: resolve(sourceDir),
			...commandOptions
		});
		app.build();
	});

// Run add
program
	.command('add [sourceDir]', 'create templates')
	.action((sourceDir = '.', commandOptions) => {
		// TODO
	});

// Run delete
program
	.command('delete [sourceDir]', 'delete templates')
	.action((sourceDir = '.', commandOptions) => {
		// TODO
	});

// Run update|upgrade
program
	.command('update [sourceDir]', 'update templates')
	.action((sourceDir = '.', commandOptions) => {
		// TODO
	});

// 任意匹配
program
	.command('*')
	.action((cmd) => log(chalk`{red Invalid mode ${cmd}}`));

program.help();
program.version('1.0.0');
program.parse();


