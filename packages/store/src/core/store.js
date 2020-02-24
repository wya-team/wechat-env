import Module from './module';
import { forEach, unifyObjectStyle, assert } from './util';

export default class Store {
	constructor(options = {}) {
		Object.defineProperty(this, 'options', {
			value: options,
			writable: true
		});

		const { state, plugins = [] } = this.options;

		this.state = (typeof state === 'function' ? state() : state) || {};	
		this.actions = {};
		this.mutations = {};
		this.modules = {};

		this.commiting = false;
		this.currentListeners = [];
		this.nextListeners = this.currentListeners;

		this.currentAsyncListeners = [];
		this.nextAsyncListeners = this.currentAsyncListeners;

		this.addModules({ 'root': options });
		this.addModules(options.modules);

		this.commit = this.commit.bind(this);
		this.dispatch = this.dispatch.bind(this);

		// apply plugins
		plugins.forEach(plugin => typeof plugin === 'function' && plugin(this));
	}

	getState() {
		return this.state;
	}

	/**
	 * 修改三个数值
	 * state
	 * actions
	 * mutations
	 */
	addModules(modules) {
		forEach(modules, (item, key) => {
			assert(!this.modules[key], `存在重复的module: ${key}`);

			let module = new Module(item, this.state[key]);
			this.modules[key] = module;
			this.state[key] = module.state;

			module.forEachMutation((mutation, type) => {
				const entry = this.mutations[type] || (this.mutations[type] = []);
				entry.push((payload) => {
					mutation.key = key;
					mutation.call(this, module.state, payload);
				});
			});

			module.forEachAction((action, type) => {
				const entry = this.actions[type] || (this.actions[type] = []);
				entry.push((payload) => {
					action.key = key;
					let res = action.call(this, {
						state: module.state,
						commit: this.commit,
						dispatch: this.dispatch,
					}, payload);

					if (!res || !res.then) {
						res = Promise.resolve(res);
					}
					return res;
				});
			});
		});
	}

	/**
	 * 只有commit才能引起数据变更
	 */
	commit(...rest) {
		const { type, payload, options } = unifyObjectStyle(...rest);
		const handlers = this.mutations[type];

		assert(!this.commiting, `mutations 不会触发当前的commit -> ${type}`);
		assert(handlers, `mutations 不存在 -> ${type}`);

		try {
			this.commiting = true;

			handlers.forEach((mutation) => {
				let result = mutation(payload);

				// 如果有返回值的话，覆盖state, 不采用浅复制
				if (result) {
					this.state[mutation.type] = result;
				}
			});

			
		} finally {
			this.commiting = false;
		}

		const listeners = this.currentListeners = this.nextListeners; // eslint-disable-line

		// mutation, state, context
		listeners.forEach(listener => listener(
			{
				type,
				payload,
				options
			}, 
			this.state,
			this
		));
	}

	/**
	 * 不能引起数据变更, 需要再次触发commit
	 */
	dispatch(...rest) {
		const { type, payload, options } = unifyObjectStyle(...rest);
		const action = { type, payload };
		const handlers = this.actions[type];

		const result = handlers.length > 1
			? Promise.all(handlers.map(action => action(payload)))
			: handlers[0](payload);

		return result.then(res => {
			try {
				const listeners = this.currentAsyncListeners = this.nextAsyncListeners; // eslint-disable-line
				// action, state, context
				listeners.forEach(listener => listener(
					{
						type,
						payload,
						options
					},
					this.state,
					this
				));
			} catch (e) {
				console.error(e);
			}
			return res;
		});
	}

	/**
	 * commit订阅同步相关事件
	 */
	subscribe(listener) {
		assert(typeof listener === 'function', `listener为函数`);

		// 确保可以更改下一个侦听器
		let fn = () => {
			if (this.nextListeners === this.currentListeners) {
				this.nextListeners = this.currentListeners.slice();
			}
		};
		fn();
		this.nextListeners.push(listener);

		let isSubscribed = true;
		let unsubscribe = () => {
			if (!isSubscribed) {
				return;
			}

			isSubscribed = false;
			fn();
			const index = this.nextListeners.indexOf(listener);
			this.nextListeners.splice(index, 1);
		};
		return unsubscribe;
	}

	/**
	 * dipatch订阅异步相关事件
	 */
	subscribeAction(listener) {
		assert(typeof listener === 'function', `listener为函数`);

		// 确保可以更改下一个异步侦听器
		let fn = () => {
			if (this.nextAsyncListeners === this.currentAsyncListeners) {
				this.nextAsyncListeners = this.currentAsyncListeners.slice();
			}
		};
		fn();
		this.nextAsyncListeners.push(listener);

		let isSubscribed = true;
		let unsubscribe = () => {
			if (!isSubscribed) {
				return;
			}

			isSubscribed = false;
			fn();
			const index = this.nextAsyncListeners.indexOf(listener);
			this.nextAsyncListeners.splice(index, 1);
		};
		return unsubscribe;
	}

	// TODO：热更新, 目前小程序不支持
	update() { }
}