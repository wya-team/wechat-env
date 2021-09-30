import { shallowEqual } from './util.js';

const defaultMapStates = (array, state, options) => {
	return array.reduce((pre, cur) => {
		pre[cur] = state[cur] || {};
		return pre;
	}, {});
};

/**
 * 全局仅对this实例注入 $store
 */
const HAS_SUBSCRIBE = '@wya/mp-store/has-subscribe';
const UNSUBSCRIBE = '@wya/mp-store/unsubscribe';

export default (next) => userOptions => {
	const { mapState, store: _store } = userOptions || {};
	const store = getApp && getApp().store || _store;

	if (!store) {
		console.warn('@wya/mp-store: 请先注入store');
		return next(userOptions);
	}

	const shouldSubscribe = Boolean(mapState);

	function getMappedState(options) {
		const state = store.getState();
		let mappedState;

		if (typeof mapState === 'function') {
			mappedState = mapState(state, options);

		} else if (mapState instanceof Array) {
			mappedState = defaultMapStates(mapState, state, options);
		}
		return mappedState;
	}

	function handleChange(options) {
		if (!this[UNSUBSCRIBE]) {
			return;
		}

		let mappedState = getMappedState(options);
		
		if (!this.data || !mappedState || shallowEqual(this.data, mappedState)) {
			return;
		}
		this.setData(mappedState);
	}

	const {
		data,
		// Page
		onLoad,
		onUnload,
		onShow,
		onHide,

		// Component
		attached,
		detached,
		lifetimes = {},
		pageLifetimes = {},
		...rest
	} = userOptions;

	const on = (hook) => {
		return function (options) {
			if (!this[HAS_SUBSCRIBE]) {
				this.$store = store;
				
				if (shouldSubscribe) {
					this[UNSUBSCRIBE] = this.$store.subscribe(handleChange.bind(this, options));
					handleChange.call(this, options);
				}
				this[HAS_SUBSCRIBE] = true;
			}
			// 注册的方法后执行，确保hook可以读取到store的状态或其他操作
			if (typeof hook === 'function') {
				hook.call(this, options);
			}
		};
	};
	
	const off = (hook) => {
		return function () {
			// 注册的方法先执行, 确保执行时可以取到store或执行其他操作;
			if (typeof hook === 'function') {
				hook.call(this);
			}

			typeof this[UNSUBSCRIBE] === 'function' && this[UNSUBSCRIBE]();

			this[HAS_SUBSCRIBE] = false;
		};
	};

	let $data;
	const mappedState = getMappedState();

	if (data && mappedState) {
		$data = { ...data, ...mappedState };
	} else if ($data || mappedState) {
		$data = { ...(data || mappedState) };
	}

	return next({
		...rest,
		data: $data,
		onLoad: on(onLoad), 
		onShow: on(onShow), 
		onUnload: off(onUnload),
		onHide: off(onHide),

		// for components
		lifetimes: {
			...lifetimes,
			attached: on(attached || lifetimes.attached),
			detached: off(detached || lifetimes.detached),
		},
		pageLifetimes: {
			...pageLifetimes,
			show: on(pageLifetimes.show),
			hide: off(pageLifetimes.hide),
		}
	});
};