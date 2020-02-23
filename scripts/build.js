const path = require('path');
const fs = require('fs-extra');
const { rollup } = require('rollup');
const Config = require('./config');

class Builder {
	constructor(config) {
		this.config = config;
	}

	process() {
		let { output, ...rest } = this.config;

		return rollup(rest)
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
