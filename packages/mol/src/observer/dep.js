import { remove } from '../utils';

let uid = 0;

export default class Dep {
	static target = null

	constructor() {
		this.id = ++uid;
		this.subs = [];
	}

	addSub(watcher) {
		this.subs.push(watcher);
	}

	removeSub(watcher) {
		remove(this.subs, watcher);
	}

	depend() {
		if (Dep.target) {
			Dep.target.addDep(this);
		}
	}

	notify() {
		this.subs.forEach(watcher => {
			watcher.update();
		});
	}
}

const targetStack = [];
export const pushTarget = target => {
	targetStack.push(target);
	Dep.target = target;
};

export const popTarget = () => {
	targetStack.pop();
	Dep.target = targetStack[targetStack.length - 1];
};
