const path = require('path');
const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { rollup } = require('rollup');
const Config = require('./config');

class Builder {
	constructor(config) {
		this.config = config;
	}

	async process() {
		let { output, script, ...rest } = this.config;
		await exec(`${script}`);
		
		rollup(rest)
			.then((builder) => builder.write({ output }))
			.then(rst => {
				console.log('Success!');
			})
			.catch(e => {
				console.log('Error!', e);
				throw e;
			});
	}
}

Config.getAllBuilds().forEach(item => new Builder(item).process());
