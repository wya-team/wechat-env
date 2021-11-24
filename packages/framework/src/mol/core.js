import { isFunc } from '../shared';

export default class Mol {
	constructor() {
		// 存放页面、组件的生命周期中需要等待的异步任务，建议仅将必要的业务层前置处理逻辑放进来，避免不必要的延后业务逻辑执行
		this.lifecycleWaitingTasks = [];
		this._taskProcess = null;
		this._taskChanged = false;
	}

	/**
	 * 添加生命周期任务
	 * @param {*} task 
	 */
	addLifecycleWaitingTask(task) {
		this.lifecycleWaitingTasks.push(task);
		this._taskChanged = true;
		// task要自行处理reject时的逻辑，保证一定会resolve，
		// 因为如果reject到这里，mol也会将该task移除，不然这个失败的任务会始终存在，
		// 导致后面调用的doLifecycleWatingTasks都会返回reject结果
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
	doLifecycleWatingTasks() {
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

	/**
	 * 注册插件
	 * @param {*} plugin 
	 */
	use(plugin, ...args) {
		if (plugin.installed) return;
		const install = plugin.install || plugin;

		if (isFunc(install)) {
			install.apply(plugin, [this, ...args]);
			plugin.installed = true;
		} else {
			throw new Error("plugin's install method is requird.");
		}
	}
}