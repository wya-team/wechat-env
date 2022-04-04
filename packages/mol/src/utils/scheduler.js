class Scheduler {
	task;

	constructor({ timeout = 5000 }) {
		this.task = new Promise((resolve, reject) => {
			this.complete = resolve;
			this.fail = reject;
			setTimeout(resolve, timeout);
		});
	}
}

export { Scheduler };