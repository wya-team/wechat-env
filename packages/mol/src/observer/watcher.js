import { pushTarget, popTarget } from './dep';
import { noop, isObject } from '../utils';

let uid = 0;

export default class Watcher {
	constructor(
		vm,
		fn,
		cb = noop,
		options = {}
	) {
		this.id = ++uid;
		this.vm = vm;
		this.getter = fn;
		// value发生变化时的回调
		this.cb = cb;
		this.deep = !!options.deep;

		this.deps = [];
		this.newDeps = [];
		this.depIds = new Set();
		this.newDepIds = new Set();

		this.value = this.get();
	}

	/**
	 * 调用getter，并进行依赖收集
	 */
	get() {
		pushTarget(this);
		const vm = this.vm;
		const value = this.getter.call(vm, vm);
		popTarget();
		this.cleanupDeps();
		return value;
	}

	addDep(dep) {
		const id = dep.id;
		if (this.newDepIds.has(id)) return;
		this.newDeps.push(dep);
		this.newDepIds.add(id);

		if (!this.depIds.has(id)) {
			dep.addSub(this);
		}
	}

	cleanupDeps() {
		this.deps.forEach(it => {
			// 将不再依赖的dep剔除掉
			if (!this.newDepIds.has(it.id)) {
				it.removeSub(this);
			}
		});
		// 依赖更新
		let tmp = this.depIds;
		this.depIds = this.newDepIds;
		this.newDepIds = tmp;
		this.newDepIds.clear();
		tmp = this.deps;
		this.deps = this.newDeps;
		this.newDeps = tmp;
		this.newDeps.length = 0;
	}

	update() {
		const value = this.get();
		if (
			value !== this.value
			// 如果value是个object，当修改它的属性时也应该更新
			|| isObject(value)
		) {
			const oldValue = this.value;
			this.value = value;
			this.cb.call(this.vm, value, oldValue);
		}
	}

	teardown() {
		this.deps.forEach(it => {
			it.removeSub(this);
		});
	}
}