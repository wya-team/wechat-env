class Scheduler {
	task;

	constructor(options = {}) {
		const { timeout = 5000 } = options;
		this.task = new Promise((resolve, reject) => {
			this.complete = resolve;
			this.fail = reject;
			setTimeout(resolve, timeout);
		});
	}
}

export { Scheduler };