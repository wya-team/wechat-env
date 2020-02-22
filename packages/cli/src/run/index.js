const fs = require('fs-extra');
const path = require('path');
const DevProcess = require('./dev');
const BuildProcess = require('./build');

module.exports = class RunManager {
	constructor(options = {}) {
		const defaultOptions = {
			withI18n: false,
			config: 'mp-cli.config.js',
		};
		this.options = { ...defaultOptions, ...options };
		this.sourceDir = this.options.sourceDir;

		this.entryDir = path.resolve(this.options.sourceDir, './src');
		this.outputDir = path.resolve(this.options.sourceDir, './dist');

		this.cwd = process.cwd();

		if (!fs.existsSync(this.entryDir)) {
			throw new Error('error');
		}

		fs.pathExistsSync(this.destDir) && fs.emptyDirSync(this.destDir);
		// 退出进程Hack
		process.on('SIGINT', process.exit);
	}


	/**
	 * 用于准备当前应用程序上下文的异步方法
	 * 其中包含加载页面和插件、应用插件等。
	 */
	async process() {
		return new Promise((resolve, reject) => {
			// TODO 
			resolve();
		});
	}

	async dev() {
		process.env.NODE_ENV = 'development';
		this.isProd = false;

		await this.process();
		this.devProcess = new DevProcess(this);
		await this.devProcess.process();
		
		const error = await new Promise(resolve => {
			try {
				this.devProcess
					.on('fileChanged', () => { 
						this.process();
					});
			} catch (err) {
				resolve(err);
			}
		});
		if (error) {
			throw error;
		}
		return this;
	}

	async build() {
		process.env.NODE_ENV = 'production';		
		this.isProd = true;

		await this.process();

		this.buildProcess = new BuildProcess(this);
		await this.buildProcess.process();
		
		return this;
	}
};

