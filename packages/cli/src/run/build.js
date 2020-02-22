const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs-extra');
const Compile = require('./compile');

class BuildProcess extends EventEmitter {
	constructor(parent) {
		super();
		process.env.NODE_ENV = 'production';

		this.$parent = parent;
	}

	/**
	 * TODO
	 */
	async process() {
		let compilation = new Compile(this);
		compilation.run();
	}
}

module.exports = BuildProcess;