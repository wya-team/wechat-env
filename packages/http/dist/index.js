'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime =  module.exports ;

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) { continue; }
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);
});

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

var runtimeModule = runtime;

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var asyncToGenerator = _asyncToGenerator;

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) { return {}; }
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) { continue; }
    target[key] = source[key];
  }

  return target;
}

var objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;

function _objectWithoutProperties(source, excluded) {
  if (source == null) { return {}; }
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) { continue; }
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) { continue; }
      target[key] = source[key];
    }
  }

  return target;
}

var objectWithoutProperties = _objectWithoutProperties;

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

// const ERROR_MAP = {
// 	HTTP_CODE_ILLEGAL: '代码错误',
// 	HTTP_URL_EMPTY: '地址为空',
// 	HTTP_SEND_FAILED: '发送失败',
// 	HTTP_TOKEN_EXPIRE: 'token校验失效',
// 	HTTP_FORCE_DESTROY: 'Http释放',
// 	HTTP_RESPONSE_PARSING_FAILED: 'reponse解析出错',
// 	HTTP_RESPONSE_REBUILD_FAILED: 'reponse重构失败',
// 	HTTP_OPTIONS_BUILD_FAILED: 'options重构失败',
// 	HTTP_STATUS_ERROR: '服务器未正常响应',
// 	HTTP_REQUEST_TIMEOUT: '请求超时',
// 	HTTP_CANCEL: '用户取消'
// };
var ERROR_CODE = {
  HTTP_CODE_ILLEGAL: 'HTTP_CODE_ILLEGAL',
  HTTP_URL_EMPTY: 'HTTP_URL_EMPTY',
  HTTP_SEND_FAILED: 'HTTP_SEND_FAILED',
  HTTP_TOKEN_EXPIRE: 'HTTP_TOKEN_EXPIRE',
  HTTP_FORCE_DESTROY: 'HTTP_FORCE_DESTROY',
  HTTP_RESPONSE_PARSING_FAILED: 'HTTP_RESPONSE_PARSING_FAILED',
  HTTP_RESPONSE_REBUILD_FAILED: 'HTTP_RESPONSE_REBUILD_FAILED',
  HTTP_OPTIONS_BUILD_FAILED: 'HTTP_OPTIONS_BUILD_FAILED',
  HTTP_STATUS_ERROR: 'HTTP_STATUS_ERROR',
  HTTP_CANCEL: 'HTTP_CANCEL',
  HTTP_REQUEST_TIMEOUT: 'HTTP_REQUEST_TIMEOUT'
};

var HttpError = function HttpError() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  classCallCheck(this, HttpError);

  if (options.exception instanceof HttpError) {
    options = options.exception;
  }

  var _options = options,
      _options$status = _options.status,
      status = _options$status === void 0 ? 0 : _options$status,
      httpStatus = _options.httpStatus,
      msg = _options.msg,
      code = _options.code,
      _options$exception = _options.exception,
      exception = _options$exception === void 0 ? {} : _options$exception,
      data = _options.data;
  this.exception = exception;
  this.status = status;
  this.httpStatus = httpStatus;
  /**
   * throw new Error('xx') -> exception.message 
   * throw { msg: 'xxx' } -> exception.msg 
   */

  this.msg = msg || exception.msg || exception.message || '';
  this.code = code;
  this.data = data;
};

HttpError.output = function () {
  var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  target.code && console.log("[@wya/http]: ".concat(target.code));
};

var getPropByPath = function getPropByPath(obj, path) {
  var target = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');
  var keyArr = path.split('.');
  var i = 0;

  for (var len = keyArr.length; i < len - 1; ++i) {
    var key = keyArr[i];

    if (key in target) {
      target = target[key];
    } else {
      throw new Error('[@wya/http]: please transfer a valid prop path to form item!');
    }
  }

  return {
    target: target,
    key: keyArr[i],
    value: target[keyArr[i]]
  };
};
/**
 * https://github.com/reduxjs/redux/blob/master/src/compose.js
 */

var compose = function compose() {
  var arguments$1 = arguments;

  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments$1[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
};
var noop = function noop() {};

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) {
var arguments$1 = arguments;
 for (var i = 1; i < arguments.length; i++) { var source = arguments$1[i] != null ? arguments$1[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var HttpAdapter =
/*#__PURE__*/
function () {
  function HttpAdapter() {
    classCallCheck(this, HttpAdapter);
  }

  createClass(HttpAdapter, null, [{
    key: "cancel",
    value: function cancel(_ref) {
      var xhr = _ref.xhr,
          options = _ref.options,
          reject = _ref.reject;
      options.setOver && options.setOver(new HttpError({
        code: ERROR_CODE.HTTP_CANCEL
      }));
    }
  }]);

  return HttpAdapter;
}();

HttpAdapter.http = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var debug = opts.debug,
      credentials = opts.credentials,
      getInstance = opts.getInstance;

  var _HttpAdapter$getOptio = HttpAdapter.getOptions(opts),
      url = _HttpAdapter$getOptio.url,
      headers = _HttpAdapter$getOptio.headers,
      body = _HttpAdapter$getOptio.body,
      method = _HttpAdapter$getOptio.method;

  var tag = "".concat(opts.url, ": ").concat(new Date().getTime());
  debug && console.time("[@wya/http]: ".concat(tag));
  return new Promise(function (resolve, reject) {
    // 用于取消
    getInstance && getInstance({
      cancel: HttpAdapter.cancel.bind(null, {
        options: opts,
        reject: reject
      })
    });
    /**
     * bug fix
     * iOS 10 fetch() 没有finally方法
     * 使用@babel/polyfill修复Promise，无法修复fetch，可以是fetch内部实现了一套Promise
     */

    var finallyHack = function finallyHack() {
      debug && console.timeEnd("[@wya/http]: ".concat(tag));
    };

    wx.request({
      url: url,
      data: body,
      header: headers,
      method: method,
      success: function success(responseText) {
        resolve(responseText);
        finallyHack();
      },
      fail: function fail(res) {
        reject(new HttpError({
          code: ERROR_CODE.HTTP_STATUS_ERROR,
          httpStatus: res.status
        }));
        finallyHack();
      }
    });
  });
};

HttpAdapter.getOptions = function (options) {
  var param = options.param,
      allowEmptyString = options.allowEmptyString,
      url = options.url,
      requestType = options.requestType;
  var isJson = requestType === 'json';
  var isFormDataJson = requestType === 'form-data:json';
  /**
   * /repo/{books_id}/{article_id} 解析RESTFUL URL 或者动 态的;
   * TODO: 是否考虑一下情况 -> /repo{/books_id}{/article_id}
   */

  var dynamic = /\{([\s\S]{1,}?(\}?)+)\}/g;

  if (dynamic.test(url)) {
    var delTmp = [];
    url = url.replace(dynamic, function (key) {
      var k = key.replace(/(\{|\}|\s)/g, '');
      delTmp.push(k);
      return getPropByPath(param, k).value || key;
    });
    delTmp.forEach(function (i) {
      return param[i] && delete param[i];
    });
  }

  var paramArray = [];

  for (var key in param) {
    /**
     * 过滤掉值为null, undefined, ''情况
     */
    if (param[key] || param[key] === false || param[key] === 0 || allowEmptyString && param[key] === '') {
      paramArray.push(key + '=' + encodeURIComponent(param[key]));
    }
  }

  if (/(JSONP|GET|DELETE)$/.test(options.method) && paramArray.length > 0) {
    url += (url.indexOf('?') > -1 ? '&' : '?') + paramArray.join('&');
  }

  var headers = {
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest'
  };
  var method = options.method;
  var body = undefined; // eslint-disable-line
  // 主动添加Header

  if (/(PUT|POST|DELETE)$/.test(options.method)) {
    // PUT + POST + DELETE
    headers['Content-Type'] = isJson ? "application/json;charset=utf-8" : "application/x-www-form-urlencoded";

    if (isJson) {
      body = _typeof_1(options.param) === 'object' ? JSON.stringify(param) : undefined;
    } else {
      body = isFormDataJson ? "data=".concat(encodeURIComponent(JSON.stringify(param))) // 业务需要
      : paramArray.join('&');
    }
  } else if (options.method === 'FORM') {
    // headers['Content-Type'] = 'multipart/form-data';
    headers['Content-Type'] = null; // 自动生成代码片段, 携带boundary=[hash], 否则后端无法接受

    method = 'POST';
    var formData = new FormData(); // 参数

    if (param) {
      Object.keys(param).forEach(function (key) {
        var fileName = undefined; // eslint-disable-line

        if (param[key] instanceof Blob) {
          // File or Blob
          fileName = param[key].name || fileName;
        }

        fileName ? formData.append(key, param[key], fileName) : formData.append(key, param[key]); // 特殊处理
      });
    }

    body = formData;
  }

  headers = _objectSpread({}, headers, {}, options.headers);
  /**
   * 清理headers
   */

  for (var h in headers) {
    if (headers.hasOwnProperty(h) && !headers[h]) {
      // eslint-disable-line
      delete headers[h];
    }
  }

  return {
    url: url,
    method: method,
    headers: headers,
    body: body
  };
};

var defaultOptions = {
  url: '',
  apis: {},
  param: null,
  type: 'GET',
  localData: null,
  // { status: 1, data: {}}
  loading: true,
  requestType: 'json',
  responseType: 'arraybuffer',
  // 'arraybuffer' | 'blob' | 'document' ...
  credentials: 'include',
  // cors下请关闭
  headers: {// Accept: 'application/json',
  },
  async: true,
  restful: false,
  debug: false,
  timeout: 20,
  // 单位s
  onOther: noop,
  onLoading: noop,
  onLoaded: noop,
  onBefore: noop,
  // 全局的onBefore优先执行
  onAfter: noop,
  // 全局的onAfter最后执行
  onProgress: null,
  getInstance: null,
  allowEmptyString: false,

  /**
   * 返回延迟
   */
  delay: undefined,
  // 单位s

  /**
   * TODO
   */
  interval: 0,
  // 轮询
  onError: noop,
  onSuccess: noop,
  onErrorRetry: noop // 失败一次重新请求

};

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) {
var arguments$1 = arguments;
 for (var i = 1; i < arguments.length; i++) { var source = arguments$1[i] != null ? arguments$1[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var HttpShell =
/*#__PURE__*/
function () {
  function HttpShell() {
    var _this = this;

    var registerOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    classCallCheck(this, HttpShell);

    var apis = registerOptions.apis,
        baseUrl = registerOptions.baseUrl,
        http = registerOptions.http,
        onBefore = registerOptions.onBefore,
        onAfter = registerOptions.onAfter,
        globalOptions = objectWithoutProperties(registerOptions, ["apis", "baseUrl", "http", "onBefore", "onAfter"]);

    this.apis = apis || {}; // 默认fetch

    this.http = http || HttpAdapter.http;
    this.onBefore = onBefore || noop;
    this.onAfter = onAfter || noop; // 与全局配置, 重新生成默认配置

    this.defaultOptions = _objectSpread$1({}, defaultOptions, {}, globalOptions);
    var allowMethod = ['get', 'post', 'put', 'delete', 'option', 'form'];
    allowMethod.forEach(function (i) {
      _this[i] = function () {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return _this.ajax(_objectSpread$1({}, opts, {
          type: i.toUpperCase()
        }));
      };
    });
  }

  createClass(HttpShell, [{
    key: "ajax",
    value: function ajax() {
      var userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var options = _objectSpread$1({}, this.defaultOptions, {}, userOptions);

      return this._sendRequest(options)["catch"](function (e) {
        options.debug && HttpError.output(e);
        return Promise.reject(e);
      });
    }
  }, {
    key: "_sendRequest",
    value: function () {
      var _sendRequest2 = asyncToGenerator(
      /*#__PURE__*/
      runtimeModule.mark(function _callee(opts) {
        var _this2 = this;

        var setOver, request, cancel;
        return runtimeModule.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this._beforeRequest(opts); // 超时或者取消请求（会有数据，但不操作)


                setOver = null;
                _context.prev = 2;
                _context.next = 5;
                return this._getRequestOptions(opts);

              case 5:
                opts = _context.sent;
                request = this._getApiPromise(opts);
                cancel = new Promise(function (_, reject) {
                  setOver = function setOver(e) {
                    delete opts.setOver;

                    _this2._beforeOver(opts);

                    reject(e);
                  };
                });
                opts.setOver = setOver;

                if (!(opts.method === 'FORM')) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt("return", Promise.race([request, cancel]));

              case 13:
                return _context.abrupt("return", Promise.race([request, cancel, new Promise(function (_, reject) {
                  setTimeout(function () {
                    _this2._beforeOver(opts);

                    reject(new HttpError({
                      code: ERROR_CODE.HTTP_REQUEST_TIMEOUT
                    }));
                  }, opts.timeout * 1000);
                })]));

              case 14:
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context["catch"](2);
                setOver && setOver(); // 强制.catch

                throw new HttpError({
                  code: ERROR_CODE.HTTP_CODE_ILLEGAL,
                  exception: _context.t0
                });

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 16]]);
      }));

      function _sendRequest(_x) {
        return _sendRequest2.apply(this, arguments);
      }

      return _sendRequest;
    }()
  }, {
    key: "_beforeRequest",
    value: function _beforeRequest() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var localData = opts.localData,
          loading = opts.loading,
          onLoading = opts.onLoading;

      if (!localData && loading) {
        onLoading({
          options: opts
        });
      }
    }
  }, {
    key: "_beforeOver",
    value: function _beforeOver() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var localData = opts.localData,
          loading = opts.loading,
          onLoaded = opts.onLoaded;

      if (!localData && loading) {
        onLoaded({
          options: opts
        });
      }
    }
  }, {
    key: "_getRequestOptions",
    value: function () {
      var _getRequestOptions2 = asyncToGenerator(
      /*#__PURE__*/
      runtimeModule.mark(function _callee2() {
        var opts,
            _opts,
            onBefore,
            _opts2,
            url,
            param,
            type,
            localData,
            requestType,
            restful,
            combo,
            method,
            _args2 = arguments;

        return runtimeModule.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                opts = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
                _context2.prev = 1;
                _opts = opts, onBefore = _opts.onBefore; // before

                _context2.prev = 3;
                _context2.next = 6;
                return this.onBefore({
                  options: opts
                });

              case 6:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 9;
                  break;
                }

                _context2.t0 = opts;

              case 9:
                opts = _context2.t0;
                _context2.next = 12;
                return onBefore({
                  options: opts
                });

              case 12:
                _context2.t1 = _context2.sent;

                if (_context2.t1) {
                  _context2.next = 15;
                  break;
                }

                _context2.t1 = opts;

              case 15:
                opts = _context2.t1;
                _context2.next = 21;
                break;

              case 18:
                _context2.prev = 18;
                _context2.t2 = _context2["catch"](3);
                throw new HttpError({
                  code: ERROR_CODE.HTTP_OPTIONS_BUILD_FAILED,
                  exception: _context2.t2
                });

              case 21:
                _opts2 = opts, url = _opts2.url, param = _opts2.param, type = _opts2.type, localData = _opts2.localData, requestType = _opts2.requestType, restful = _opts2.restful;

                if (!/[a-zA-z]+:\/\/[^\s]*/.test(url)) {
                  combo = url.split('?'); // 避免before带上?token=*之类

                  url = "".concat(this.apis[combo[0]] || '').concat(combo[1] ? "?".concat(combo[1]) : '');
                }

                if (!(!url && !localData)) {
                  _context2.next = 25;
                  break;
                }

                throw new HttpError({
                  code: ERROR_CODE.HTTP_URL_EMPTY
                });

              case 25:
                method = type.toUpperCase();
                return _context2.abrupt("return", _objectSpread$1({}, opts, {
                  url: url,
                  method: method
                }));

              case 29:
                _context2.prev = 29;
                _context2.t3 = _context2["catch"](1);
                throw new HttpError({
                  code: ERROR_CODE.HTTP_CODE_ILLEGAL,
                  exception: _context2.t3
                });

              case 32:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 29], [3, 18]]);
      }));

      function _getRequestOptions() {
        return _getRequestOptions2.apply(this, arguments);
      }

      return _getRequestOptions;
    }()
  }, {
    key: "_getApiPromise",
    value: function _getApiPromise() {
      var _this3 = this;

      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var localData = opts.localData,
          delay = opts.delay;
      return new Promise(function (onSuccess, onError) {
        var temp; // 通常用于请求返回的参数解析不是json时用（结合onAfter强制status: 1）

        var target = localData ? Promise.resolve(localData) : _this3.http(opts);

        var done = function done(next) {
          return function (res) {
            _this3._beforeOver(opts);

            next(res);
          };
        };

        var delayDone = function delayDone(next) {
          return function (res) {
            typeof delay === 'number' ? setTimeout(function () {
              return next(res);
            }, delay * 1000) : next(res);
          };
        };

        var resolve = compose(delayDone, done)(onSuccess);
        var reject = compose(delayDone, done)(onError); // 不使用async/await 直观一些

        target.then(function (response) {
          temp = response;
          return response = _typeof_1(response) === 'object' ? response : JSON.parse(response);
        })["catch"](function (e) {
          return new HttpError({
            code: ERROR_CODE.HTTP_RESPONSE_PARSING_FAILED,
            exception: e,
            data: temp
          });
        }).then(function (response) {
          temp = null; // 重新构成结果

          return _this3._disposeResponse({
            options: opts,
            response: response,
            resolve: resolve,
            reject: reject
          });
        })["catch"](function (e) {
          reject(e);
        });
      });
    }
  }, {
    key: "_disposeResponse",
    value: function () {
      var _disposeResponse2 = asyncToGenerator(
      /*#__PURE__*/
      runtimeModule.mark(function _callee3() {
        var opts,
            options,
            response,
            resolve,
            reject,
            onOther,
            onAfter,
            other,
            error,
            res,
            _args3 = arguments;
        return runtimeModule.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                opts = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {};
                _context3.prev = 1;
                options = opts.options, response = opts.response, resolve = opts.resolve, reject = opts.reject; // 已经取消

                if (!(!options.localData && !options.setOver)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return");

              case 5:
                onOther = options.onOther, onAfter = options.onAfter; // after

                _context3.prev = 6;
                _context3.next = 9;
                return onAfter({
                  response: response,
                  options: options
                });

              case 9:
                _context3.t0 = _context3.sent;

                if (_context3.t0) {
                  _context3.next = 12;
                  break;
                }

                _context3.t0 = response;

              case 12:
                response = _context3.t0;
                _context3.next = 15;
                return this.onAfter({
                  response: response,
                  options: options
                });

              case 15:
                _context3.t1 = _context3.sent;

                if (_context3.t1) {
                  _context3.next = 18;
                  break;
                }

                _context3.t1 = response;

              case 18:
                response = _context3.t1;
                _context3.next = 24;
                break;

              case 21:
                _context3.prev = 21;
                _context3.t2 = _context3["catch"](6);
                throw new HttpError({
                  code: ERROR_CODE.HTTP_RESPONSE_REBUILD_FAILED,
                  exception: _context3.t2
                });

              case 24:
                _context3.t3 = response.status;
                _context3.next = _context3.t3 === 1 ? 27 : _context3.t3 === true ? 27 : _context3.t3 === 0 ? 29 : _context3.t3 === false ? 29 : 31;
                break;

              case 27:
                resolve(response);
                return _context3.abrupt("return");

              case 29:
                reject(response);
                return _context3.abrupt("return");

              case 31:
                other = onOther && onOther({
                  response: response,
                  resolve: resolve,
                  reject: reject
                }); // eslint-disable-line

                if (!(!other || _typeof_1(other) !== 'object' || !other.then)) {
                  _context3.next = 37;
                  break;
                }

                error = _objectSpread$1({}, new HttpError({
                  code: ERROR_CODE.HTTP_FORCE_DESTROY
                }), {}, response); // 强制释放内存

                reject(error);
                _context3.next = 47;
                break;

              case 37:
                _context3.prev = 37;
                _context3.next = 40;
                return other;

              case 40:
                res = _context3.sent;
                res && _typeof_1(res) === 'object' && (res.status === 1 || res.status === true) ? resolve(res) : reject(res);
                _context3.next = 47;
                break;

              case 44:
                _context3.prev = 44;
                _context3.t4 = _context3["catch"](37);
                reject(_context3.t4);

              case 47:
                _context3.next = 52;
                break;

              case 49:
                _context3.prev = 49;
                _context3.t5 = _context3["catch"](1);
                throw new HttpError({
                  code: ERROR_CODE.HTTP_CODE_ILLEGAL,
                  exception: _context3.t5
                });

              case 52:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 49], [6, 21], [37, 44]]);
      }));

      function _disposeResponse() {
        return _disposeResponse2.apply(this, arguments);
      }

      return _disposeResponse;
    }()
  }]);

  return HttpShell;
}();

var createHttpClient = function createHttpClient() {
  var registerOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var clientWrapper = new HttpShell(registerOptions);
  var allowMethod = ['ajax', 'get', 'post', 'put', 'delete', 'option', 'form'];
  var client = {};
  allowMethod.forEach(function (m) {
    client[m] =
    /*#__PURE__*/
    function () {
      var _ref = asyncToGenerator(
      /*#__PURE__*/
      runtimeModule.mark(function _callee(userOptions) {
        return runtimeModule.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", clientWrapper[m](userOptions));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();
  });
  return client;
};

var _createHttpClient = createHttpClient(),
    ajax = _createHttpClient.ajax;

exports.HttpAdapter = HttpAdapter;
exports.HttpError = HttpError;
exports.HttpShell = HttpShell;
exports.ajax = ajax;
exports.default = createHttpClient;
