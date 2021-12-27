export const initPreprocessingTask = (Mol) => {
	// 存放页面、组件的生命周期中需要等待的预处理任务（异步任务），建议仅将必要的业务层前置处理逻辑放进来，避免不必要的延后业务逻辑执行
	Mol._preprocessingTasks = [];
	Mol._pendingPromise = null;
	Mol._isTasksChanged = false;

	/**
	 * 添加预处理任务
	 * @param {*} task 
	 */
	 Mol.addPreprocessingTask = function (task) {
		if (this._preprocessingTasks.includes(task)) return;
		
		this._preprocessingTasks.push(task);
		this._isTasksChanged = true;
		// task要自行处理reject时的逻辑，保证一定会resolve后逻辑正常
		// 因为不管是resolve还是reject到这里，Mol都会将该task移除，不然失败的任务会始终存在，
		// 导致后面调用的 doPreprocessingTasks 都会返回reject结果，使后续的业务逻辑不再执行
		task.finally(() => {
			const index = this._preprocessingTasks.findIndex(it => it === task);
			this._preprocessingTasks.splice(index, 1);
			this._isTasksChanged = true;
		});
	};

	/**
	 * 等待预处理执行完毕
	 * @returns 
	 */
	 Mol.waitPreprocessing = function () {
		if (!this._preprocessingTasks.length) {
			this._isTasksChanged = false;
			return;
		}
		if (this._isTasksChanged || !this._pendingPromise) {
			this._pendingPromise = Promise.all(this._preprocessingTasks);
			this._isTasksChanged = false;
		}
		     
		return this._pendingPromise;
	};
};