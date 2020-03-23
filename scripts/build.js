const path = require('path');
const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { rollup: rollupBuilder } = require('rollup');
const Config = require('./config');

class Builder {
	constructor(config) {
		this.config = config;
	}

	async process() {
		let { script, rollup } = this.config;
		script && await exec(`${script}`);
		
		if (!rollup) return;
		const { output, ...rest } = rollup;
		rollupBuilder(rest)
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
