'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shallowEqual = function (objA, objB) {
	if (objA === objB) {
		return true;
	}

	var keysA = Object.keys(objA);
	var keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	// Test for A's keys different from B.
	var hasOwn = Object.prototype.hasOwnProperty;
	for (var i = 0; i < keysA.length; i++) {
		if (!hasOwn.call(objB, keysA[i])
				|| objA[keysA[i]] !== objB[keysA[i]]) {
			return false;
		}
	}

	return true;
};

var defaultMapStates = function (array, state, options) {
	return array.reduce(function (pre, cur) {
		pre[cur] = state[cur] || {};
		return pre;
	}, {});
};


function connect (next) { return function (userOptions) {
	var ref = userOptions || {};
	var mapState = ref.mapState;
	var _store = ref.store;
	var store = getApp && getApp().store || _store;

	if (!store) {
		return next(userOptions);
	}

	var shouldSubscribe = Boolean(mapState);

	function handleChange(options) {
		if (!this.$unsubscribe) {
			return;
		}

		var state = this.$store.getState();
		var mappedState;

		if (typeof mapState === 'function') {
			mappedState = mapState(state, options);

		} else if (mapState instanceof Array) {
			mappedState = defaultMapStates(mapState, state);
		}
		
		if (!this.data || !mappedState || shallowEqual(this.data, mappedState)) {
			return;
		}
		this.setData(mappedState);
	}

	var _onLoad = userOptions.onLoad;
	var _onUnload = userOptions.onUnload;
	var _attached = userOptions.attached;
	var _detached = userOptions.detached;

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
		if (typeof _attached === 'function') {
			_attached.call(this, options);
		}
	}

	function onUnload() {
		if (typeof _onUnload === 'function') {
			_onUnload.call(this);
		}
		if (typeof _detached === 'function') {
			_detached.call(this, options);
		}
		typeof this.$unsubscribe === 'function' && this.$unsubscribe();
	}

	return next(Object.assign({}, userOptions,
		{onLoad: onLoad, 
		onUnload: onUnload,
		attached: onLoad,
		detached: onUnload}));
}; }

var assert = function (condition, msg) {
};

var forEach = function (obj, fn) {
	Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
};

var isObject = function (obj) {
	return obj !== null && typeof obj === 'object';
};

var unifyObjectStyle = function (type, payload, options) {
	if (isObject(type) && type.type) {
		options = payload;
		payload = type;
		type = type.type;
	}

	return { type: type, payload: payload, options: options };
};

var Module = function Module(options, initialState) {
	Object.defineProperty(this, 'options', {
		value: options,
		writable: true
	});

	var ref = this.options;
	var state = ref.state;
	this.state = (typeof state === 'function' ? state() : state) || initialState || {};
};

Module.prototype.forEachAction = function forEachAction (fn) {
	if (this.options.actions) {
		forEach(this.options.actions, fn);
	}
};

Module.prototype.forEachMutation = function forEachMutation (fn) {
	if (this.options.mutations) {
		forEach(this.options.mutations, fn);
	}
};

// TODO：热更新, 目前小程序不支持
Module.prototype.update = function update () { };

var Store = function Store(options) {
	var this$1 = this;
	if ( options === void 0 ) options = {};

	Object.defineProperty(this, 'options', {
		value: options,
		writable: true
	});

	var ref = this.options;
	var state = ref.state;
	var plugins = ref.plugins; if ( plugins === void 0 ) plugins = [];

	this.state = (typeof state === 'function' ? state() : state) || {};	
	this.actions = {};
	this.mutations = {};
	this.modules = {};

	this.commiting = false;
	this.currentListeners = [];
	this.nextListeners = this.currentListeners;

	this.currentAsyncListeners = [];
	this.nextAsyncListeners = this.currentAsyncListeners;

	this.addModules({ 'root': options });
	this.addModules(options.modules);

	this.commit = this.commit.bind(this);
	this.dispatch = this.dispatch.bind(this);

	// apply plugins
	plugins.forEach(function (plugin) { return typeof plugin === 'function' && plugin(this$1); });
};

Store.prototype.getState = function getState () {
	return this.state;
};

/**
	 * 修改三个数值
	 * state
	 * actions
	 * mutations
	 */
Store.prototype.addModules = function addModules (modules) {
		var this$1 = this;

	forEach(modules, function (item, key) {
		assert(!this$1.modules[key]);

		var module = new Module(item, this$1.state[key]);
		this$1.modules[key] = module;
		this$1.state[key] = module.state;

		module.forEachMutation(function (mutation, type) {
			var entry = this$1.mutations[type] || (this$1.mutations[type] = []);
			entry.push(function (payload) {
				mutation.key = key;
				mutation.call(this$1, module.state, payload);
			});
		});

		module.forEachAction(function (action, type) {
			var entry = this$1.actions[type] || (this$1.actions[type] = []);
			entry.push(function (payload) {
				action.key = key;
				var res = action.call(this$1, {
					state: module.state,
					commit: this$1.commit,
					dispatch: this$1.dispatch,
				}, payload);

				if (!res || !res.then) {
					res = Promise.resolve(res);
				}
				return res;
			});
		});
	});
};

/**
	 * 只有commit才能引起数据变更
	 */
Store.prototype.commit = function commit () {
		var this$1 = this;
		var rest = [], len = arguments.length;
		while ( len-- ) rest[ len ] = arguments[ len ];

	var ref = unifyObjectStyle.apply(void 0, rest);
		var type = ref.type;
		var payload = ref.payload;
		var options = ref.options;
	var handlers = this.mutations[type];

	assert(!this.commiting);

	try {
		this.commiting = true;

		handlers.forEach(function (mutation) {
			var result = mutation(payload);

			// 如果有返回值的话，覆盖state, 不采用浅复制
			if (result) {
				this$1.state[mutation.type] = result;
			}
		});

			
	} finally {
		this.commiting = false;
	}

	var listeners = this.currentListeners = this.nextListeners; // eslint-disable-line
	listeners.forEach(function (listener) { return listener({
		state: this$1.state,
		commit: this$1.commit,
		dispatch: this$1.dispatch,
		type: type,
		payload: payload,
		options: options
	}); });
};

/**
	 * 不能引起数据变更, 需要再次触发commit
	 */
Store.prototype.dispatch = function dispatch () {
		var this$1 = this;
		var rest = [], len = arguments.length;
		while ( len-- ) rest[ len ] = arguments[ len ];

	var ref = unifyObjectStyle.apply(void 0, rest);
		var type = ref.type;
		var payload = ref.payload;
		var options = ref.options;
	var handlers = this.actions[type];

	var result = handlers.length > 1
		? Promise.all(handlers.map(function (action) { return action(payload); }))
		: handlers[0](payload);

	return result.then(function (res) {
		try {
			var listeners = this$1.currentAsyncListeners = this$1.nextAsyncListeners; // eslint-disable-line
			listeners.forEach(function (listener) { return listener({
				state: this$1.state,
				commit: this$1.commit,
				dispatch: this$1.dispatch,
				type: type,
				payload: payload,
				options: options
			}); });
		} catch (e) {
			console.error(e);
		}
		return res;
	});
};

/**
	 * commit订阅同步相关事件
	 */
Store.prototype.subscribe = function subscribe (listener) {
		var this$1 = this;

	// 确保可以更改下一个侦听器
	var fn = function () {
		if (this$1.nextListeners === this$1.currentListeners) {
			this$1.nextListeners = this$1.currentListeners.slice();
		}
	};
	fn();
	this.nextListeners.push(listener);

	var isSubscribed = true;
	var unsubscribe = function () {
		if (!isSubscribed) {
			return;
		}

		isSubscribed = false;
		fn();
		var index = this$1.nextListeners.indexOf(listener);
		this$1.nextListeners.splice(index, 1);
	};
	return unsubscribe;
};

/**
	 * dipatch订阅异步相关事件
	 */
Store.prototype.subscribeAction = function subscribeAction (listener) {
		var this$1 = this;

	// 确保可以更改下一个异步侦听器
	var fn = function () {
		if (this$1.nextAsyncListeners === this$1.currentAsyncListeners) {
			this$1.nextAsyncListeners = this$1.currentAsyncListeners.slice();
		}
	};
	fn();
	this.nextAsyncListeners.push(listener);

	var isSubscribed = true;
	var unsubscribe = function () {
		if (!isSubscribed) {
			return;
		}

		isSubscribed = false;
		fn();
		var index = this$1.nextAsyncListeners.indexOf(listener);
		this$1.nextAsyncListeners.splice(index, 1);
	};
	return unsubscribe;
};

// TODO：热更新, 目前小程序不支持
Store.prototype.update = function update () { };

exports.Store = Store;
exports.default = connect;
