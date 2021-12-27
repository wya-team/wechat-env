import {
	APP_WAIT_LIFECYCLES,
	PAGE_WAIT_LIFECYCLES,
	COMPONENT_WAIT_LIFECYCLES,
	COMPONENT_PAGE_WAIT_LIFECYCLES
} from '../constants';
import Mol from '../class/mol';
import MolApp from '../class/mol-app';
import MolPage from '../class/mol-page';
import MolComponent from '../class/mol-component';
import { normalizeComponentLifecycles, isReservedField } from '../utils';
import { initInjector } from './injector';

const callHook = (vm, hookName, args, isComponent = false) => {
	const hook = isComponent ? vm.$mol.$options.lifetimes[hookName] : vm.$mol.$options[hookName];
	hook && hook.apply(vm, args);
};

const getOptionsForNative = molOptions => {
	const opts = {};
	Object.keys(molOptions).forEach(key => {
		if (!isReservedField(key)) {
			opts[key] = molOptions[key];
		}
	});
	return opts;
};

export const patchApp = (appOptions) => {
	// 需最先执行，配置项合并
	const molApp = new MolApp(appOptions);
	APP_WAIT_LIFECYCLES.forEach(it => {
		let lifecycle = molApp.$options[it];
		if (lifecycle) {
			molApp.$options[it] = async function (...args) {
				// 保证必要的等待任务执行完成，再执行业务逻辑
				await Mol.waitPreprocessing();
				lifecycle.apply(this, args);
			};
		}
	});

	appOptions = getOptionsForNative(molApp.$options);

	appOptions.onLaunch = function (...args) {
		molApp.$native = this;
		// 注册 $mol
		this.$mol = molApp;
		callHook(this, 'beforeLaunch', args);
		callHook(this, 'onLaunch', args);
	};

	appOptions.onShow = function (...args) {
		// 在业务的onShow前触发 beforeShow 钩子
		callHook(this, 'beforeShow', args);
		callHook(this, 'onShow', args);
	};

	return appOptions;
};


export const patchPage = (pageOptions) => {
	// 需最先执行，配置项合并
	const molPage = new MolPage(pageOptions);
	PAGE_WAIT_LIFECYCLES.forEach(it => {
		const lifecycle = molPage.$options[it];
		const isOnUnload = it === 'onUnload';
		
		if (lifecycle || isOnUnload) {
			molPage.$options[it] = async function (...args) {
				await Mol.waitPreprocessing();

				lifecycle && lifecycle.apply(this, args);
				isOnUnload && this.$mol.$destroy();
			};
		}
	});

	pageOptions = getOptionsForNative(molPage.$options);
	
	pageOptions.onLoad = function (...args) {
		molPage.$native = this;
		// 注册 $mol
		this.$mol = molPage;
		callHook(this, 'beforeCreate', args);
		const { injector } = molPage.$options;
		injector && initInjector(this, injector, Mol.provider.get());
		callHook(this, 'created', args);
		callHook(this, 'onLoad', args);
	};

	return pageOptions;
};

export const patchComponent = (compOptions) => {
	normalizeComponentLifecycles(compOptions);
	// 需最先执行，配置项合并
	const molComponent = new MolComponent(compOptions);
	const { lifetimes, pageLifetimes } = molComponent.$options;
	
	COMPONENT_WAIT_LIFECYCLES.forEach(it => {
		const lifecycle = lifetimes[it];
		const isDetached = it === 'detached';
		if (lifecycle || isDetached) {
			molComponent.$options.lifetimes[it] = async function (...args) {
				await Mol.waitPreprocessing();

				lifecycle && lifecycle.apply(this, args);
				isDetached && this.$mol.$destroy();
			};
		}
	});
	if (pageLifetimes) {
		COMPONENT_PAGE_WAIT_LIFECYCLES.forEach(it => {
			const lifecycle = pageLifetimes[it];
			if (lifecycle) {
				molComponent.$options.pageLifetimes[it] = async function (...args) {
					await Mol.waitPreprocessing();
					lifecycle.apply(this, args);
				};
			}
		});
	}

	compOptions = getOptionsForNative(molComponent.$options);
	
	compOptions.lifetimes.created = function (...args) {
		molComponent.$native = this;
		// 注册 $mol
		this.$mol = molComponent;
		callHook(this, 'beforeCreate', args, true /* isComponent */);
		callHook(this, 'created', args, true);
	};
	compOptions.lifetimes.attached = function (...args) {
		callHook(this, 'beforeAttach', args, true);
		const { injector } = molComponent.$options;
		injector && initInjector(this, injector, Mol.provider.get());
		callHook(this, 'attached', args, true);
	};

	return compOptions;
};