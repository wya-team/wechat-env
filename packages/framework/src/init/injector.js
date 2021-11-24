import Watcher from '../observer/watcher';

export const initInjector = (vm, injector, provideData) => {
	const getter = () => {
		injector.call(vm, provideData);
	};
	const watcher = new Watcher(
		vm,
		getter
	);
	vm._watchers.push(watcher);
	vm._injectorWatcher = watcher;
};