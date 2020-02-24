'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

var shallowEqual = function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  } // Test for A's keys different from B.


  var hasOwn = Object.prototype.hasOwnProperty;

  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
};

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) {
var arguments$1 = arguments;
 for (var i = 1; i < arguments.length; i++) { var source = arguments$1[i] != null ? arguments$1[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var defaultMapStates = function defaultMapStates(array, state, options) {
  return array.reduce(function (pre, cur) {
    pre[cur] = state[cur] || {};
    return pre;
  }, {});
};

var connect = (function (next) {
  return function (userOptions) {
    var _ref = userOptions || {},
        mapState = _ref.mapState,
        _store = _ref.store;

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

    var _onLoad = userOptions.onLoad,
        _onUnload = userOptions.onUnload,
        _attached = userOptions.attached,
        _detached = userOptions.detached;

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

    return next(_objectSpread({}, userOptions, {
      onLoad: onLoad,
      onUnload: onUnload,
      attached: onLoad,
      detached: onUnload
    }));
  };
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) { descriptor.writable = true; }
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) { _defineProperties(Constructor.prototype, protoProps); }
  if (staticProps) { _defineProperties(Constructor, staticProps); }
  return Constructor;
}

var createClass = _createClass;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
});

var assert = function assert(condition, msg) {
};
var forEach = function forEach(obj, fn) {
  Object.keys(obj || {}).forEach(function (key) {
    return fn(obj[key], key);
  });
};
var isObject = function isObject(obj) {
  return obj !== null && _typeof_1(obj) === 'object';
};
var unifyObjectStyle = function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  return {
    type: type,
    payload: payload,
    options: options
  };
};

var Module =
/*#__PURE__*/
function () {
  function Module(options, initialState) {
    classCallCheck(this, Module);

    Object.defineProperty(this, 'options', {
      value: options,
      writable: true
    });
    var state = this.options.state;
    this.state = (typeof state === 'function' ? state() : state) || initialState || {};
  }

  createClass(Module, [{
    key: "forEachAction",
    value: function forEachAction(fn) {
      if (this.options.actions) {
        forEach(this.options.actions, fn);
      }
    }
  }, {
    key: "forEachMutation",
    value: function forEachMutation(fn) {
      if (this.options.mutations) {
        forEach(this.options.mutations, fn);
      }
    } // TODO：热更新, 目前小程序不支持

  }, {
    key: "update",
    value: function update() {}
  }]);

  return Module;
}();

var Store =
/*#__PURE__*/
function () {
  function Store() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    classCallCheck(this, Store);

    Object.defineProperty(this, 'options', {
      value: options,
      writable: true
    });
    var _this$options = this.options,
        state = _this$options.state,
        _this$options$plugins = _this$options.plugins,
        plugins = _this$options$plugins === void 0 ? [] : _this$options$plugins;
    this.state = (typeof state === 'function' ? state() : state) || {};
    this.actions = {};
    this.mutations = {};
    this.modules = {};
    this.commiting = false;
    this.currentListeners = [];
    this.nextListeners = this.currentListeners;
    this.currentAsyncListeners = [];
    this.nextAsyncListeners = this.currentAsyncListeners;
    this.addModules({
      'root': options
    });
    this.addModules(options.modules);
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this); // apply plugins

    plugins.forEach(function (plugin) {
      return typeof plugin === 'function' && plugin(_this);
    });
  }

  createClass(Store, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
    /**
     * 修改三个数值
     * state
     * actions
     * mutations
     */

  }, {
    key: "addModules",
    value: function addModules(modules) {
      var _this2 = this;

      forEach(modules, function (item, key) {
        assert(!_this2.modules[key]);
        var module = new Module(item, _this2.state[key]);
        _this2.modules[key] = module;
        _this2.state[key] = module.state;
        module.forEachMutation(function (mutation, type) {
          var entry = _this2.mutations[type] || (_this2.mutations[type] = []);
          entry.push(function (payload) {
            mutation.key = key;
            mutation.call(_this2, module.state, payload);
          });
        });
        module.forEachAction(function (action, type) {
          var entry = _this2.actions[type] || (_this2.actions[type] = []);
          entry.push(function (payload) {
            action.key = key;
            var res = action.call(_this2, {
              state: module.state,
              commit: _this2.commit,
              dispatch: _this2.dispatch
            }, payload);

            if (!res || !res.then) {
              res = Promise.resolve(res);
            }

            return res;
          });
        });
      });
    }
    /**
     * 只有commit才能引起数据变更
     */

  }, {
    key: "commit",
    value: function commit() {
      var _this3 = this;

      var _unifyObjectStyle = unifyObjectStyle.apply(void 0, arguments),
          type = _unifyObjectStyle.type,
          payload = _unifyObjectStyle.payload,
          options = _unifyObjectStyle.options;

      var handlers = this.mutations[type];
      assert(!this.commiting);

      try {
        this.commiting = true;
        handlers.forEach(function (mutation) {
          var result = mutation(payload); // 如果有返回值的话，覆盖state, 不采用浅复制

          if (result) {
            _this3.state[mutation.type] = result;
          }
        });
      } finally {
        this.commiting = false;
      }

      var listeners = this.currentListeners = this.nextListeners; // eslint-disable-line

      listeners.forEach(function (listener) {
        return listener({
          state: _this3.state,
          commit: _this3.commit,
          dispatch: _this3.dispatch,
          type: type,
          payload: payload,
          options: options
        });
      });
    }
    /**
     * 不能引起数据变更, 需要再次触发commit
     */

  }, {
    key: "dispatch",
    value: function dispatch() {
      var _this4 = this;

      var _unifyObjectStyle2 = unifyObjectStyle.apply(void 0, arguments),
          type = _unifyObjectStyle2.type,
          payload = _unifyObjectStyle2.payload,
          options = _unifyObjectStyle2.options;
      var handlers = this.actions[type];
      var result = handlers.length > 1 ? Promise.all(handlers.map(function (action) {
        return action(payload);
      })) : handlers[0](payload);
      return result.then(function (res) {
        try {
          var listeners = _this4.currentAsyncListeners = _this4.nextAsyncListeners; // eslint-disable-line

          listeners.forEach(function (listener) {
            return listener({
              state: _this4.state,
              commit: _this4.commit,
              dispatch: _this4.dispatch,
              type: type,
              payload: payload,
              options: options
            });
          });
        } catch (e) {
          console.error(e);
        }

        return res;
      });
    }
    /**
     * commit订阅同步相关事件
     */

  }, {
    key: "subscribe",
    value: function subscribe(listener) {
      var _this5 = this;

      var fn = function fn() {
        if (_this5.nextListeners === _this5.currentListeners) {
          _this5.nextListeners = _this5.currentListeners.slice();
        }
      };

      fn();
      this.nextListeners.push(listener);
      var isSubscribed = true;

      var unsubscribe = function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        isSubscribed = false;
        fn();

        var index = _this5.nextListeners.indexOf(listener);

        _this5.nextListeners.splice(index, 1);
      };

      return unsubscribe;
    }
    /**
     * dipatch订阅异步相关事件
     */

  }, {
    key: "subscribeAction",
    value: function subscribeAction(listener) {
      var _this6 = this;

      var fn = function fn() {
        if (_this6.nextAsyncListeners === _this6.currentAsyncListeners) {
          _this6.nextAsyncListeners = _this6.currentAsyncListeners.slice();
        }
      };

      fn();
      this.nextAsyncListeners.push(listener);
      var isSubscribed = true;

      var unsubscribe = function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        isSubscribed = false;
        fn();

        var index = _this6.nextAsyncListeners.indexOf(listener);

        _this6.nextAsyncListeners.splice(index, 1);
      };

      return unsubscribe;
    } // TODO：热更新, 目前小程序不支持

  }, {
    key: "update",
    value: function update() {}
  }]);

  return Store;
}();

var normalizeMap = function normalizeMap(map) {
  return Array.isArray(map) ? map.map(function (key) {
    return {
      key: key,
      val: key
    };
  }) : Object.keys(map).map(function (key) {
    return {
      key: key,
      val: map[key]
    };
  });
};

var mapActions = function mapActions(actions) {
  var res = {};
  normalizeMap(actions).forEach(function (_ref) {
    var key = _ref.key,
        val = _ref.val;

    res[key] = function () {
      var arguments$1 = arguments;

      var dispatch = this.$store.dispatch;

      for (var _len = arguments.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments$1[_key];
      }

      return typeof val === 'function' ? val.apply(this, [dispatch].concat(arg)) : dispatch.apply(this.$store, [val].concat(arg));
    };
  });
  return res;
};

var find = function find(list, f) {
  return list.filter(f)[0];
};
var deepCopy = function deepCopy(obj) {
  var cache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  // just return if obj is immutable value
  if (obj === null || _typeof_1(obj) !== 'object') {
    return obj;
  } // if obj is hit, it is in circular structure


  var hit = find(cache, function (c) {
    return c.original === obj;
  });

  if (hit) {
    return hit.copy;
  }

  var copy = Array.isArray(obj) ? [] : {}; // put the copy into cache at first
  // because we want to refer it in recursive deepCopy

  cache.push({
    original: obj,
    copy: copy
  });
  Object.keys(obj).forEach(function (key) {
    copy[key] = deepCopy(obj[key], cache);
  });
  return copy;
};

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};

var pad = function pad(num, maxLength) {
  return repeat('0', maxLength - num.toString().length) + num;
};

var createLogger = function createLogger() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$collapsed = _ref.collapsed,
      collapsed = _ref$collapsed === void 0 ? true : _ref$collapsed,
      _ref$filter = _ref.filter,
      filter = _ref$filter === void 0 ? function (mutation, stateBefore, stateAfter) {
    return true;
  } : _ref$filter,
      _ref$transformer = _ref.transformer,
      transformer = _ref$transformer === void 0 ? function (state) {
    return state;
  } : _ref$transformer,
      _ref$mutationTransfor = _ref.mutationTransformer,
      mutationTransformer = _ref$mutationTransfor === void 0 ? function (mut) {
    return mut;
  } : _ref$mutationTransfor,
      _ref$logger = _ref.logger,
      logger = _ref$logger === void 0 ? console : _ref$logger;

  return function (store) {
    var prevState = deepCopy(store.state);
    store.subscribe(function (mutation, state) {
      if (typeof logger === 'undefined') {
        return;
      }

      var nextState = deepCopy(state);

      if (filter(mutation, prevState, nextState)) {
        var time = new Date();
        var formattedTime = " @ ".concat(pad(time.getHours(), 2), ":").concat(pad(time.getMinutes(), 2), ":").concat(pad(time.getSeconds(), 2), ".").concat(pad(time.getMilliseconds(), 3)); // eslint-disable-line

        var formattedMutation = mutationTransformer(mutation);
        var message = "mutation ".concat(mutation.type).concat(formattedTime);
        var startMessage = collapsed ? logger.groupCollapsed : logger.group; // render

        try {
          startMessage.call(logger, message);
        } catch (e) {
          console.log(message);
        }

        logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState));
        logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation);
        logger.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState));

        try {
          logger.groupEnd();
        } catch (e) {
          logger.log('—— log end ——');
        }
      }

      prevState = nextState;
    });
  };
};

exports.Store = Store;
exports.createLogger = createLogger;
exports.default = connect;
exports.mapActions = mapActions;
