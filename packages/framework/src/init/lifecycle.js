import {
	APP_LIFECYCLES,
	PAGE_LIFECYCLES,
	COMPONENT_LIFECYCLES,
	COMPONENT_PAGE_LIFECYCLES
} from '../shared';

import { initInjector } from './injector';

export const patchAppLifecycle = (appOptions, dola) => {
	APP_LIFECYCLES.forEach(it => {
		let lifecycle = appOptions[it];
		if (lifecycle) {
			appOptions[it] = async function (...args) {
				// 保证必要的等待任务执行完成，再执行业务逻辑
				await dola.doLifecycleWatingTasks();
				lifecycle.apply(this, args);
			};
		}
	});
	const onLaunch = appOptions.onLaunch;
	appOptions.onLaunch = function (...args) {
		// 注册 $dola
		this.$dola = dola;
		onLaunch && onLaunch.apply(this, args);
	};
};


export const patchPageLifecycle = (pageOptions, dola) => {
	PAGE_LIFECYCLES.forEach(it => {
		let lifecycle = pageOptions[it];
		const isOnload = it === 'onLoad';
		const isOnUnload = it === 'onUnload';
		
		if (lifecycle || isOnUnload || isOnload) {
			pageOptions[it] = async function (...args) {
				await dola.doLifecycleWatingTasks();
				lifecycle && lifecycle.apply(this, args);

				if (isOnload) {
					// 页面实例的所有watcher存放数组
					this._watchers = [];
					pageOptions.injector && initInjector(this, pageOptions.injector, dola.provider.get());
				} else if (isOnUnload) {
					this._watchers.forEach(it => {
						it.teardown();
					});
				}
			};
		}
	});
	const onLoad = pageOptions.onLoad;
	pageOptions.onLoad = function (...args) {
		// 注册 $dola
		this.$dola = dola;
		onLoad && onLoad.apply(this, args);
	};
};

export const patchComponentLifecycle = (compOptions, dola) => {
	const { lifetimes = {}, pageLifetimes } = compOptions;
	if (!compOptions.lifetimes) {
		compOptions.lifetimes = {};
	}
	
	COMPONENT_LIFECYCLES.forEach(it => {
		let lifecycle = lifetimes[it] || compOptions[it];
		const isAttached = it === 'attached';
		const isDetached = it === 'detached';
		if (lifecycle || isAttached || isDetached) {
			compOptions.lifetimes[it] = async function (...args) {
				await dola.doLifecycleWatingTasks();
				lifecycle && lifecycle.apply(this, args);

				if (isAttached) {
					this._watchers = [];
					compOptions.injector && initInjector(this, compOptions.injector, dola.provider.get());
				} else if (isDetached) {
					this._watchers.forEach(it => {
						it.teardown();
					});
				}
			};
		}
	});
	if (pageLifetimes) {
		COMPONENT_PAGE_LIFECYCLES.forEach(it => {
			let lifecycle = pageLifetimes[it];
			if (lifecycle) {
				compOptions.pageLifetimes[it] = async function (...args) {
					await dola.doLifecycleWatingTasks();
					lifecycle.apply(this, args);
				};
			}
		});
	}
	const created = compOptions.created;
	compOptions.created = function (...args) {
		// 注册 $dola
		this.$dola = dola;
		created && created.apply(this, args);
	};
};