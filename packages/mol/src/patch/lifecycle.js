import {
	APP_HOOKS,
	PAGE_HOOKS,
	APP_WAIT_HOOKS,
	PAGE_WAIT_HOOKS,
	COMPONENT_WAIT_HOOKS,
	COMPONENT_PAGE_WAIT_HOOKS,
	BUILT_IN_FIELDS
} from '../constants';
import Mol from '../class/mol';
import MolApp from '../class/mol-app';
import MolPage from '../class/mol-page';
import MolComponent from '../class/mol-component';
import { isReservedField, Scheduler } from '../utils';
import { initInjector } from './injector';
import {
	initPageQuery, 
	initComponentQuery,
	updateQueryData
} from './query';

// 页面初始化任务，用于控制当app.onShow时页面的初始化在同一轮预处理任务的事件循环中
let pageReadyTask = null;

/**
 * 更新当前激活的页面
 * @param {*} page 
 */
const updateActivePage = (page) => {
	Mol.activePage = page;
};

const callHook = (vm, hookName, args, isComponent = false) => {
	const molOptions = vm.$mol.$options;
	const hooks = isComponent 
		? molOptions.lifetimes[hookName] || molOptions.pageLifetimes[hookName] 
		: molOptions[hookName];

	// 自定义的钩子可能不存在对应的钩子callback
	if (!hooks) return;

	// 如onLoad等这种钩子会被合并成数组挂载在$mol.$options中
	if (Array.isArray(hooks)) {
		for (let i = 0; i < hooks.length; i++) {
			hooks[i].apply(vm, args);
		}
	} else {
		// 如onShareAppMessage等这种需要返回值的钩子，只能存在一个，故不会被合并成数组，并且需要return返回值
		return hooks.apply(vm, args);
	}
};

const createInjector = (vm) => {
	const injectors = vm.$mol.$options.injector;

	return injectors && function (data) {
		const length = injectors.length;
		for (let i = 0; i < length; i++) {
			injectors[i].call(this, data);
		}
	};
};

const createNativeHookFn = (hookName, waitHooks, isComponent) => {
	return waitHooks.includes(hookName)
		? hookName === 'onLoad' || hookName === 'attached'
			? async function (...args) {
				// 保证预处理任务执行完成，再执行业务逻辑
				await Mol.waitPreprocessing();

				// case 1：
				// 如果是扫描小程序码等会触发app.onShow的场景时，
				// 如果使用了 queryParser 插件，此时的 $query 是已经过 queryParser 解析的，
				// 因为业务中会在 app.beforeShow 钩子中调用queryParser；
				// case 2：
				// 如果是页面间跳转，此时的 $query 依然是未被 queryParser 解析过的，理论上来说这算是一个bug
				// 因为进入一个页面时的生命周期顺序是：组件 attached 是先于页面 onLoad 的
				// 而解析的任务时是在页面的 beforeLoad 生命周期钩子中才被添加的
				// 所以组件 attached 时的预处理任务池中并没有包含 query 解析任务
				// 因此此时调用 updateQueryData，操作的还是未被解析的 query
				// 但是由于实际业务场景中，在页面间跳转时，query 实际上并不需要解析，
				// queryParser 也主要是服务于从外部进入小程序时携带非真实参数的场景
				// 所以页面间跳转时的这个 case 目前来看可以不处理
				updateQueryData(this);

				const injector = createInjector(this);
				injector && initInjector(this, injector, Mol.provider.get());

				return callHook(this, hookName, args, isComponent);
			}
			: async function (...args) {
				// 保证预处理任务执行完成，再执行业务逻辑
				await Mol.waitPreprocessing();
				return callHook(this, hookName, args, isComponent);
			}
		: function (...args) {
			// 因为有些钩子是需要返回值的，故需要return
			return callHook(this, hookName, args, isComponent);
		};
};

/**
 * @param {*} molVm this.$mol
 * @param {*} hooks 钩子数组
 * @returns 用于传给原生构造方法的配置数据
 */
const getOptionsForNative = (molVm, hooks, waitHooks) => {
	const opts = {};
	const molOptions = molVm.$options;
	const isComponent = molVm._isComponent;

	Object.keys(molOptions).forEach(key => {
		if (isComponent && key === 'lifetimes' || key === 'pageLifetimes') {
			!opts[key] && (opts[key] = {});

			Object.keys(molOptions[key]).forEach(hookName => {
				opts[key][hookName] = createNativeHookFn(hookName, waitHooks, true);
			});
		} else if (hooks.includes(key)) {
			opts[key] = createNativeHookFn(key, waitHooks, false);
		} else if (!isReservedField(key) && !BUILT_IN_FIELDS.includes(key)) {
			opts[key] = molOptions[key];
		}
	});

	// 如果存在injector，但是用户未定义相应钩子时，需要提供对应的钩子以供initInjector
	if (molOptions.injector) {
		if (molVm._isPage && !opts.onLoad) {
			opts.onLoad = createNativeHookFn('onLoad', waitHooks, false);
		} else if (molVm._isComponent && !opts.lifetimes.attached) {
			opts.lifetimes.attached = createNativeHookFn('attached', waitHooks, true);
		}
	}

	return opts;
};

export const patchApp = (appOptions) => {
	// 需最先执行，配置项合并
	const molApp = new MolApp(appOptions);

	appOptions = getOptionsForNative(
		molApp,
		APP_HOOKS,
		APP_WAIT_HOOKS
	);

	const { onLaunch, onShow } = appOptions;
	appOptions.onLaunch = function (...args) {
		molApp.$native = this;
		// mount $mol
		this.$mol = molApp;
		callHook(this, 'beforeLaunch', args);
		onLaunch && onLaunch.apply(this, args);
	};

	appOptions.onShow = function (...args) {
		if (!pageReadyTask) {
			// 创建页面初始化任务
			pageReadyTask = new Scheduler();
			Mol.addPreprocessingTask(pageReadyTask.task);
		}
		
		// 在业务的onShow前触发 beforeShow 钩子
		callHook(this, 'beforeShow', args);
		onShow && onShow.apply(this, args);
	};

	return appOptions;
};


export const patchPage = (pageOptions) => {
	// 需最先执行，配置项合并
	const molPage = new MolPage(pageOptions);

	pageOptions = getOptionsForNative(
		molPage,
		PAGE_HOOKS,
		PAGE_WAIT_HOOKS
	);

	const { onLoad, onShow, onUnload } = pageOptions;
	pageOptions.onLoad = function (...args) {
		updateActivePage(this);

		molPage.$native = this;
		// mount $mol
		this.$mol = molPage;

		// 初始化 $query
		// 如果使用了 queryParser 插件，则此时的 $query 是还未被 queryParser 解析过的
		// 因为 queryParser 是在 beforeLoad 中调用的
		// 此时初始化 $query 是为了后续的钩子（如 beforeLoad）中都能获取到该属性
		initPageQuery(this, args[0]);

		callHook(this, 'beforeLoad', args);
		onLoad && onLoad.apply(this, args);
	};

	pageOptions.onShow = function (...args) {
		// 页面返回的等场景，只会触发 onShow，所以也需要在 onShow 中更新
		updateActivePage(this);

		if (pageReadyTask) {
			pageReadyTask.complete();
			pageReadyTask = null;
		}
		
		onShow && onShow.apply(this, args);
	};

	pageOptions.onUnload = function (...args) {
		const res = onUnload && onUnload.apply(this, args);
		if (res && res.then) {
			res.then(() => {
				this.$mol.$destroy();
			});
		} else {
			this.$mol.$destroy();
		}
	};

	return pageOptions;
};

export const patchComponent = (compOptions) => {
	// 需最先执行，配置项合并
	const molComponent = new MolComponent(compOptions);

	compOptions = getOptionsForNative(
		molComponent,
		[],
		[...COMPONENT_WAIT_HOOKS, ...COMPONENT_PAGE_WAIT_HOOKS]
	);

	const { created, attached, detached } = compOptions.lifetimes;

	compOptions.lifetimes.created = function (...args) {
		molComponent.$native = this;
		// mount $mol
		this.$mol = molComponent;

		// 初始化 this.$query，设置 this.$query 代理逻辑
		initComponentQuery(this);

		// 注意，beforeCreate 钩子中不能使用到 this.$query
		callHook(this, 'beforeCreate', args, true /* isComponent */);
		created && created.apply(this, args);
	};

	compOptions.lifetimes.attached = function (...args) {
		callHook(this, 'beforeAttach', args, true);
		attached && attached.apply(this, args);
	};

	compOptions.lifetimes.detached = function (...args) {
		const res = detached && detached.apply(this, args);
		if (res && res.then) {
			res.then(() => {
				this.$mol.$destroy();
			});
		} else {
			this.$mol.$destroy();
		}
	};

	return compOptions;
};