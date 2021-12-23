export default class Mol {
	// 存放页面、组件的生命周期中需要等待的异步任务，建议仅将必要的业务层前置处理逻辑放进来，避免不必要的延后业务逻辑执行
	static lifecycleWaitingTasks = []

	static _taskProcess = null

	static _taskChanged = false

	/**
	 * 添加生命周期任务
	 * @param {*} task 
	 */
	static addLifecycleWaitingTask(task) {
		if (this.lifecycleWaitingTasks.includes(task)) return;
		
		this.lifecycleWaitingTasks.push(task);
		this._taskChanged = true;
		// task要自行处理reject时的逻辑，保证一定会resolve，
		// 因为如果reject到这里，mol也会将该task移除，不然这个失败的任务会始终存在，
		// 导致后面调用的doLifecycleWaitingTasks都会返回reject结果
		task.finally(() => {
			const index = this.lifecycleWaitingTasks.findIndex(it => it === task);
			this.lifecycleWaitingTasks.splice(index, 1);
			this._taskChanged = true;
		});
	}

	/**
	 * 执行生命周期任务
	 * @returns 
	 */
	static doLifecycleWaitingTasks() {
		if (!this.lifecycleWaitingTasks.length) {
			this._taskChanged = false;
			return;
		}
		if (this._taskChanged || !this._taskProcess) {
			this._taskProcess = Promise.all(this.lifecycleWaitingTasks);
			this._taskChanged = false;
		}
		     
		return this._taskProcess;
	}
}