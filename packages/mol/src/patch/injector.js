import Watcher from '../observer/watcher';

export const initInjector = (vm, injector, provideData) => {
	const molVm = vm.$mol;
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