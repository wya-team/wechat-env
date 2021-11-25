import Watcher from '../observer/watcher';

export const initInjector = (vm, molVm, injector, provideData) => {
	const getter = () => {
		injector.call(vm, provideData);
	};
	const watcher = new Watcher(
		vm,
		getter
	);
	molVm._watchers.push(watcher);
	molVm._injectorWatcher = watcher;
};