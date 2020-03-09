import { shallowEqual } from './util.js';

const defaultMapStates = (array, state, options) => {
	return array.reduce((pre, cur) => {
		pre[cur] = state[cur] || {};
		return pre;
	}, {});
};


export default (next) => userOptions => {
	const { mapState, store: _store } = userOptions || {};
	const store = getApp && getApp().store || _store;

	if (!store) {
		return next(userOptions);
	}

	const shouldSubscribe = Boolean(mapState);
	let hasSubscribe = false;

	function handleChange(options) {
		if (!this.$unsubscribe) {
			return;
		}

		const state = this.$store.getState();
		let mappedState;

		if (typeof mapState === 'function') {
			mappedState = mapState(state, options);

		} else if (mapState instanceof Array) {
			mappedState = defaultMapStates(mapState, state, options);
		}
		
		if (!this.data || !mappedState || shallowEqual(this.data, mappedState)) {
			return;
		}
		this.setData(mappedState);
	}

	const {
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
			if (!hasSubscribe) {
				this.$store = store;
				if (!this.$store) {
					warning("Store对象不存在!");
				}
				if (shouldSubscribe) {
					this.$unsubscribe = this.$store.subscribe(handleChange.bind(this, options));
					handleChange.call(this, options);
				}
				hasSubscribe = true;
			}
			if (typeof hook === 'function') {
				hook.call(this, options);
			}
		};
	};
	
	const off = (hook) => {
		return function () {

			if (typeof hook === 'function') {
				hook.call(this);
			}

			typeof this.$unsubscribe === 'function' && this.$unsubscribe();

			hasSubscribe = false;
		};
	};

	return next({
		...rest,
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