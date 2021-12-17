import {
	APP_BEFORE_SHOW,
	APP_WAIT_LIFECYCLES,
	PAGE_WAIT_LIFECYCLES,
	COMPONENT_WAIT_LIFECYCLES,
	COMPONENT_PAGE_WAIT_LIFECYCLES
} from '../constants';
import Mol from '../class/mol';
import MolApp from '../class/mol-app';
import MolPage from '../class/mol-page';
import MolComponent from '../class/mol-component';

import { initInjector } from './injector';

export const patchAppLifecycle = (appOptions) => {
	const molApp = new MolApp();
	APP_WAIT_LIFECYCLES.forEach(it => {
		let lifecycle = appOptions[it];
		if (lifecycle) {
			appOptions[it] = async function (...args) {
				// 保证必要的等待任务执行完成，再执行业务逻辑
				await Mol.doLifecycleWaitingTasks();
				lifecycle.apply(this, args);
			};
		}
	});
	const onLaunch = appOptions.onLaunch;
	appOptions.onLaunch = function (...args) {
		molApp.$native = this;
		// 注册 $mol
		this.$mol = molApp;
		onLaunch && onLaunch.apply(this, args);
		const { injector } = appOptions;
		injector && initInjector(this, molApp, injector, Mol.provider.get());
	};

	const onShow = appOptions.onShow;
	const beforeShowHook = appOptions[APP_BEFORE_SHOW];
	appOptions.onShow = function (...args) {
		// 在业务的onShow前触发beforeShowHook
		beforeShowHook && beforeShowHook.apply(this, args);
		onShow && onShow.apply(this, args);
	};
};


export const patchPageLifecycle = (pageOptions) => {
	const molPage = new MolPage();
	PAGE_WAIT_LIFECYCLES.forEach(it => {
		let lifecycle = pageOptions[it];
		const isOnLoad = it === 'onLoad';
		const isOnUnload = it === 'onUnload';
		
		if (lifecycle || isOnUnload || isOnLoad) {
			pageOptions[it] = async function (...args) {
				await Mol.doLifecycleWaitingTasks();
				lifecycle && lifecycle.apply(this, args);

				if (isOnLoad) {
					const { injector } = pageOptions;
					injector && initInjector(this, molPage, injector, Mol.provider.get());
				} else if (isOnUnload) {
					molPage.$destroy();
				}
			};
		}
	});
	const onLoad = pageOptions.onLoad;
	pageOptions.onLoad = function (...args) {
		molPage.$native = this;
		// 注册 $mol
		this.$mol = molPage;
		onLoad && onLoad.apply(this, args);
	};
};

export const patchComponentLifecycle = (compOptions) => {
	const molComponent = new MolComponent();
	const { lifetimes = {}, pageLifetimes } = compOptions;
	if (!compOptions.lifetimes) {
		compOptions.lifetimes = {};
	}
	
	COMPONENT_WAIT_LIFECYCLES.forEach(it => {
		let lifecycle = lifetimes[it] || compOptions[it];
		const isAttached = it === 'attached';
		const isDetached = it === 'detached';
		if (lifecycle || isAttached || isDetached) {
			compOptions.lifetimes[it] = async function (...args) {
				await Mol.doLifecycleWaitingTasks();
				lifecycle && lifecycle.apply(this, args);

				if (isAttached) {
					const { injector } = compOptions;
					injector && initInjector(this, molComponent, injector, Mol.provider.get());
				} else if (isDetached) {
					molComponent.$destroy();
				}
			};
		}
	});
	if (pageLifetimes) {
		COMPONENT_PAGE_WAIT_LIFECYCLES.forEach(it => {
			let lifecycle = pageLifetimes[it];
			if (lifecycle) {
				compOptions.pageLifetimes[it] = async function (...args) {
					await Mol.doLifecycleWaitingTasks();
					lifecycle.apply(this, args);
				};
			}
		});
	}
	const created = compOptions.created;
	compOptions.created = function (...args) {
		molComponent.$native = this;
		// 注册 $mol
		this.$mol = molComponent;
		created && created.apply(this, args);
	};
};