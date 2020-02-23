import { shallowEqual } from './util.js';

const defaultMapStates = (array, state, options) => {
	return array.reduce((pre, cur) => {
		pre[cur] = state[cur] || {};
		return pre;
	}, {});
};


export default (next) => userOptions => {
	const { mapState, store: _store } = userOptions;
	const store = (getApp ? getApp().store : _store);

	if (!store) {
		return next(userOptions);
	}

	const shouldSubscribe = Boolean(mapState);

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
		onLoad: _onLoad,
		onUnload: _onUnload,
	} = userOptions;

	function onLoad(options) {
		this.$store = store;
		if (!this.$store) {
			warning("Store对象不存在!");
		}
		if (shouldSubscribe) {
			this.$unsubscribe = this.$store.subscribe(handleChange.bind(this, options));
			handleChange.call(this, options);
		}
		if (typeof _onLoad === 'function') {
			_onLoad.call(this, options);
		}
	}

	function onUnload() {
		if (typeof _onUnload === 'function') {
			_onUnload.call(this);
		}
		typeof this.$unsubscribe === 'function' && this.$unsubscribe();
	}

	return next({
		...userOptions,
		onLoad, 
		onUnload
	});
};