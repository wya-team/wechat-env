import {
	APP_LIFECYCLES,
	PAGE_LIFECYCLES,
	COMPONENT_LIFECYCLES,
	COMPONENT_PAGE_LIFECYCLES
} from '../shared';

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
		if (lifecycle) {
			pageOptions[it] = async function (...args) {
				await dola.doLifecycleWatingTasks();
				lifecycle.apply(this, args);
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
	
	COMPONENT_LIFECYCLES.forEach(it => {
		let lifecycle = lifetimes[it] || compOptions[it];
		if (lifecycle) {
			compOptions.lifetimes[it] = async function (...args) {
				await dola.doLifecycleWatingTasks();
				lifecycle.apply(this, args);
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