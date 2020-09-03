const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

const gulpConfig = path.resolve(__dirname, './compiler.js');

class BuildProcess extends EventEmitter {
	constructor(parent) {
		super();

		this.$parent = parent;
	}

	/**
	 * TODO
	 */
	async process() {
		let $process = exec(`npx gulp -f ${gulpConfig} build --color`);

		$process.stdout.on('data', stdout => console.info(stdout));
		$process.stderr.on('data', stderr => console.info(stderr));
	}
}

module.exports = BuildProcess;