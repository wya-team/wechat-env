import { allPromiseSettled } from '../utils';

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
	};

	/**
	 * 任务内 在reject前 跳转了其他页面，导致页面的onLoad没有被执行，跳转前可以清楚下当前的任务
	 * @param {*} tasks 
	 */
	Mol.clearPreprocessingTask = function (tasks) {
		if (!Array.isArray(tasks)) {
			tasks = [tasks];
		}
		Mol._preprocessingTasks = tasks.length > 0 ? Mol._preprocessingTasks.filter((task) => !tasks.includes(task)) : [];
		Mol._pendingPromise = null;
		Mol._isTasksChanged = false;
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
			this._preprocessingTasks.forEach(it => {
				// 打标记，用于finally时清除
				it.__processed__ = true;
			});
			this._pendingPromise = Promise.all(this._preprocessingTasks);
			// 当前处理队列中的全部任务完成或者失败后才进行统一清除
			allPromiseSettled(this._preprocessingTasks).then(() => {
				this._pendingPromise = null;
				// 将已处理的任务清除（无论成功还是失败）
				this._preprocessingTasks = this._preprocessingTasks.filter(it => !it.__processed__);
				this._isTasksChanged = true;
			});
			this._isTasksChanged = false;
		}
		     
		return this._pendingPromise;
	};
};