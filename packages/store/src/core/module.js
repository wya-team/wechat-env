import { forEach } from './util';

export default class Module {
	constructor(options, initialState) {
		Object.defineProperty(this, 'options', {
			value: options,
			writable: true
		});

		const { state } = this.options;
		this.state = (typeof state === 'function' ? state() : state) || initialState || {};
	}

	forEachAction(fn) {
		if (this.options.actions) {
			forEach(this.options.actions, fn);
		}
	}

	forEachMutation(fn) {
		if (this.options.mutations) {
			forEach(this.options.mutations, fn);
		}
	}

	// TODO：热更新, 目前小程序不支持
	update() { }
}
