'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var timestamp = +(new Date());
var index = 0;
/**
 * timestamp在某些场景下是有必要的
 */
var getUid = function (prefix, opts) {
	if ( prefix === void 0 ) prefix = 'wya';

	return (prefix + "-" + timestamp + "-" + (++index));
};


/**
 * 小于10的数字前面加0
 */
var preZero = function (num) {
	if (num < 10 && num > 0) {
		return "0" + num;
	} else if (num <= 0) {
		return '00';
	}
	return num;
};
/**
 * [description]
 */
var def = function (obj, key, val, enumerable) {
	Object.defineProperty(obj, key, {
		value: val,
		enumerable: !!enumerable,
		writable: true,
		configurable: true
	});
};

var isObj = function (target) { return typeof target === 'object'; };

/**
 * 判断是否存在
 */
var hasOwn = function (target, key) { return Object.prototype.hasOwnProperty.call(target, key); };

/**
 * 深拷贝
 * TODO: Date,RegExp 对象
 */
var baseClone = function (target, source) {
	for (var k in source) {
		// 只拷贝实例属性，不进行原型的拷贝
		if (hasOwn(source, k)) {
			// 引用类型的数据单独处理, null -> object
			if (source[k] && typeof source[k] == 'object') {
				target[k] = Array.isArray(source[k]) ? [] : {};
				// 递归处理引用类型数据(利用引用处理)
				baseClone(target[k], source[k]);
			} else {
				// 值类型的数据直接进行拷贝
				target[k] = source[k];
			}
		}
	}
	return target;
};
var cloneDeep = function (source) {
	return source && typeof source === 'object' 
		? baseClone(Array.isArray(source) ? [] : {}, source) 
		: source;
};
var cloneDeepEasier = function (source) { return JSON.parse(JSON.stringify(source)); };

/**
 * 输入金额
 */
var formatMoney = function (string, opts) {

	if (!string) {
		string = '0.00';
	}
	var value = string;
	value = value.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
	value = value.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
	value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
	value = value.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');// 只能输入两个小数
	if (value.indexOf(".") < 0 && value != "") { // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
		value = parseFloat(value);
	}
	return value;
};

/**
 * 二进制求和值转数组
 */
var sum2array = function (value) {
	return parseInt(value, 10).toString(2).split('').reduce(function (pre, cur, index, source) {
		+cur && pre.unshift(
			Math.pow(2, source.length - index - 1) // eslint-disable-line
		);
		return pre;
	}, []);
};

var compose = function () {
	var funcs = [], len = arguments.length;
	while ( len-- ) funcs[ len ] = arguments[ len ];

	if (funcs.length === 0) {
		return function (arg) { return arg; };
	}
	if (funcs.length === 1) {
		return funcs[0];
	}
	return funcs.reduce(function (a, b) { return function () {
		var args = [], len = arguments.length;
		while ( len-- ) args[ len ] = arguments[ len ];

		return a(b.apply(void 0, args));
 }		});
};

var Utils = {
	getUid: getUid,
	preZero: preZero,
	def: def,
	isObj: isObj,
	hasOwn: hasOwn,
	cloneDeep: cloneDeep,
	cloneDeepEasier: cloneDeepEasier,
	formatMoney: formatMoney,
	sum2array: sum2array,
	compose: compose,
	/**
	 * 扩展或重写
	 */
	set: function set(key, method) {
		if (typeof key === 'string') {
			this[key] = method;
		} else if (typeof key === 'object') {
			var target = key;
			for (var _ in target) {
				this[_] = target[_];
			}
		}
	}
};

var STORAGE_PERMISSION_ALLOW = (function () {
	var test = 'test';
	try {
		wx.setStorageSync(test, test);
		wx.removeStorageSync(test);
		return true;
	} catch (e) {
		return false;
	}
})();

var StorageManager = function StorageManager () {};

StorageManager.prototype.setVersion = function setVersion (version, clear, opts) {

	this.version = version;

	if (!STORAGE_PERMISSION_ALLOW) { return; }
	// TODO 清除之前的缓存
};

/**
	 * 设置缓存
	 * @param key 保存的键值
	 * @param val 保存的内容
	 */
StorageManager.prototype.set = function set (key, val, opts) {

	if (STORAGE_PERMISSION_ALLOW) {
		wx.setStorageSync(key, val);
	}
};

/**
	 * 获取缓存
	 * @param  {[String]} key 获取的键值
	 * @return {Object}
	 */
StorageManager.prototype.get = function get (key, opts) {

	if (STORAGE_PERMISSION_ALLOW) {
		return wx.getStorageSync(key);
	}
};

/**
	 * 删除缓存
	 * @param  {[String]} key 删除的键值
	 */
StorageManager.prototype.remove = function remove (key, opts) {

	if (STORAGE_PERMISSION_ALLOW) {
		wx.removeStorageSync(key);
	}
};

var Storage = new StorageManager();

var URL = {
	/**
	 * 创建新的url
	 */
	merge: function merge(route, opts) {

		var path = route.path;
		var query = route.query;
		var result = path instanceof Array 
			? path.join('/')
			: path;

		var queryArr = [];
		for (var key in query) {
			if (query[key] || query[key] === false || query[key] === 0) { // 过滤掉值为null,undefined,''情况
				queryArr = queryArr.concat( [(key + "=" + (encodeURIComponent(query[key])))]);
			}
		}

		if (queryArr.length > 0) {
			result += (result.indexOf('?') > -1 ? '&' : '?') + queryArr.join('&');
		}
		return result;
	},
	/**
	 * 解析url
	 * @param  {String} url
	 * @return {Object}
	 */	
	parse: function parse(url, opts) {

		// TODO: 使用 new window.URL(url);
		url = url || ("" + (location.pathname) + (location.search));
		var path = [];
		var query = {};
		// const urlArr = url.replace('/', '').split('?');
		var urlArr = url.split('?');
		path = urlArr[0].split('/');

		if (urlArr.length > 1) {
			urlArr[1].split('&').forEach(function (str) {
				var arr = str.split('=');
				var key = arr[0];
				var value = decodeURIComponent(arr[1]);
				// 009, ''
				if (
					isNaN(value) 
					|| value[0] === '0' 
					|| value === '' 
					|| value > Number.MAX_SAFE_INTEGER
				) {
					query[key] = value;
				} else {
					query[key] = Number(value);
				}
			});
		}

		return {
			path: path,
			query: query
		};
	},
	get: function get(key, url, opts) {

		url = url 
			? url.substring(url.indexOf('?')) 
			: '';

		var regExp = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
		var val = decodeURIComponent(url).substr(1).match(regExp);

		val = val != null ? unescape(val[2]) : null;

		try {
			val = JSON.parse(val);
			// 避免string套string, 暂时处理，可考虑while
			val = typeof val === 'string' ? JSON.parse(val) : val;
		} catch (e) {
			console.log(e);
		}
		return val;
	}
};

var REGEX_RULES = {
	num: {
		value: /^\d+(\.\d+)?$/,
		msg: "请输入正确数字"
	},
	integer: {
		value: /^[1-9]\d*$/,
		msg: "请输入非负整数"
	},
	email: {
		value: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
		msg: "邮箱格式不正确"
	},
	date: {
		value: /^\d{4}(-|\/|\.)\d{1,2}\1\d{1,2}$/,
		msg: "日期格式不正确"
	},
	time: {
		value: /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/,
		msg: "时间格式不正确"
	},
	IDCard: {
		// value: /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/,
		value: /(^[0-9a-zA-Z]{6,}$)/, // 港澳台比较特殊
		msg: "身份证格式不正确"
	},
	price: {
		// value: /^([+-]?[1-9][\d]{0,3}|0)([.]?[\d]{1,2})?$/,
		value: /^([1-9][\d]{0,10}|0)([.]?[\d]{1,2})?$/,
		msg: "请输入正确金额"
	},
	mobile: {
		value: /^(1[3-9][0-9])\d{8}$/,
		// value: /^\d+(\.\d+)?$/,
		msg: "请填写正确的手机号码"
	},
	phone: {
		value: /^0[1-9][0-9]{1,2}-[2-8][0-9]{6,7}$/,
		msg: "请填写正确的电话号码"
	},
	postalCode: {
		value: /^\d{4}$/,
		msg: "请输入4位短信验证码"
	},
	zipCode: {
		value: /^\d{6}$/,
		msg: "请输入6位邮政编码"
	},
	weChat: {
		value: /^[a-zA-Z\d_-]{5,}$/,
		msg: "请输入正确的微信号"
	},
	name: {
		value: /^[A-Za-z0-9\u4e00-\u9fa5_-]{1,}$/,
		msg: "请不要输入特殊字符"
	},
	base64: {
		value: /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i,
		msg: "请输入正确的base64"
	},
	URLScheme: {
		value: /[a-zA-z]+:\/\/[^\s]*/,
		msg: "请填写正确网页地址协议"
	},
};

var format = function (rules) {
	if ( rules === void 0 ) rules = {};

	return Object.keys(rules).reduce(function (pre, cur) {
		pre[cur] = rules[cur].value;
		pre[(cur + "Msg")] = rules[cur].msg;
		return pre;
	}, {});
};

var RegExManager = function RegExManager(rules) {
	if ( rules === void 0 ) rules = {};

	this._generate(rules);

	this.validator = this.validator.bind(this);
};

RegExManager.prototype.set = function set (key, rule) {
		var obj;

	if (typeof key === 'string') {
		this._generate(( obj = {}, obj[key] = rule, obj ));
	} else if (typeof key === 'object') {
		this._generate(key);
	}
};

/**
	 * for async-validator
	 * rule: {
	 * name, // 用于提示必填
	 * type,
	 * required,
	 * message,
	 * msg,
	 * , // 依赖其他选项时
	 * }
	 */
RegExManager.prototype.validator = function validator (rule, value, callback, opts) {

	var errorMsg;
	var auto = true;

	if (typeof value === 'string') {
		value = value.trim();
	}

	var required = typeof rule.required === 'function'
		? (auto = !rule.required.length, rule.required(callback))
		: rule.required;

	if (required && (!value || (value instanceof Array && !value.length))) {
		errorMsg = (rule.name || '') + "必填";
		auto && callback(errorMsg);
		return false;
	}
	var rules = rule.type instanceof Array ? rule.type : [rule.type];

	for (var i = 0; i < rules.length; i++) {
		var type = rules[i];
		var val = value;
		if (type == 'mobile') {
			val = val || '';
			val = val.replace(/\s/g, '');
		}

		var isError = typeof type === 'function' 
			? (auto = !type.length, !type(callback))
			: this[type] && val && !this[type].test(val);

		if (isError) {
			errorMsg = rule.message || rule.msg || this[(type + "Msg")];
			rules.length - 1 == i && auto && callback(errorMsg);
		} else {
			auto && callback();
			break;
		}
	}
};

RegExManager.prototype._generate = function _generate (rules) {
	var target = format(rules);
	for (var key in target) {
		this[key] = target[key];
	}
	return this;
};

// {
// 	name,
// 	type,
// 	msg,
// 	required,
// 	validator: Regex.validator
// }

var RegEx = new RegExManager(REGEX_RULES);

/**
 * 浮点数计算 加法
 * @param arg1
 * @param arg2
 * @returns {number}
 */
var add = function (arg1, arg2, opts) {

	var r1, r2, m, c; // eslint-disable-line
	try {
		r1 = arg1.toString().split(".")[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split(".")[1].length;
	} catch (e) {
		r2 = 0;
	}
	c = Math.abs(r1 - r2);
	m = Math.pow(10, Math.max(r1, r2)); // eslint-disable-line
	if (c > 0) {
		var cm = Math.pow(10, c); // eslint-disable-line
		if (r1 > r2) {
			arg1 = Number(arg1.toString().replace(".", ""));
			arg2 = Number(arg2.toString().replace(".", "")) * cm;
		} else {
			arg1 = Number(arg1.toString().replace(".", "")) * cm;
			arg2 = Number(arg2.toString().replace(".", ""));
		}
	} else {
		arg1 = Number(arg1.toString().replace(".", ""));
		arg2 = Number(arg2.toString().replace(".", ""));
	}
	return (arg1 + arg2) / m;
};

/**
 * 浮点数计算 减法
 * @param arg1
 * @param arg2
 * @returns {string}
 */
var sub = function (arg1, arg2, opts) {

	var r1, r2, m, n; // eslint-disable-line
	try {
		r1 = arg1.toString().split(".")[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split(".")[1].length;
	} catch (e) {
		r2 = 0;
	}
	m = Math.pow(10, Math.max(r1, r2)); // eslint-disable-line
	n = (r1 >= r2) ? r1 : r2;
	return ((arg1 * m - arg2 * m) / m).toFixed(n);
};
/**
 * 浮点数计算 乘法
 * @param arg1
 * @param arg2
 * @returns {number}
 */
var mul = function (arg1, arg2, opts) {

	var m = 0, s1 = arg1.toString(), s2 = arg2.toString();  // eslint-disable-line
	try {
		m += s1.split(".")[1].length;
	} catch (e) {
		console.log(e);
	}
	try {
		m += s2.split(".")[1].length;
	} catch (e) {
		console.log(e);
	}
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);  // eslint-disable-line
};
/**
 * 浮点数计算 除法
 * @param arg1
 * @param arg2
 * @returns {number}
 */
var div = function (arg1, arg2, opts) {

	var t1 = 0, t2 = 0, r1, r2;  // eslint-disable-line
	try {
		t1 = arg1.toString().split(".")[1].length;
	} catch (e) {
		console.log(e);
	}
	try {
		t2 = arg2.toString().split(".")[1].length;
	} catch (e) {
		console.log(e);
	}

	r1 = Number(arg1.toString().replace(".", ""));
	r2 = Number(arg2.toString().replace(".", ""));
	return (r1 / r2) * Math.pow(10, t2 - t1); // eslint-disable-line
};

/**
 * 浮点数计算 取模
 * @param {*} arg1 
 * @param {*} arg2 
 * @param {*} opts 
 */
var mod = function (arg1, arg2, opts) {

	var t1 = 0, t2 = 0;  // eslint-disable-line
	try {
		t1 = arg1.toString().split(".")[1].length;
	} catch (e) {
		console.log(e);
	}
	try {
		t2 = arg2.toString().split(".")[1].length;
	} catch (e) {
		console.log(e);
	}
	var multiple = Math.pow( 10, Math.max(t1, t2) );

	return ((arg1 * multiple) % (arg2 * multiple)) / multiple;
};

/**
 * 针对以上加减乘除
 * 支持链式调用
 * (new CalcManager(1)).add(1).add(2).val()
 * class -> babel 
 */
var CalcManager = function CalcManager(val, opts) {

	this.result = val;
};

CalcManager.prototype.add = function add$1 (val) {
	this.result = add(this.result, val);
	return this;
};

CalcManager.prototype.sub = function sub$1 (val, isExchange) {
	this.result = isExchange 
		? sub(val, this.result)
		: sub(this.result, val);
	return this;
};

CalcManager.prototype.mul = function mul$1 (val) {
	this.result = mul(this.result, val);
	return this;
};

CalcManager.prototype.div = function div$1 (val, isExchange) {
	this.result = isExchange 
		? div(val, this.result)
		: div(this.result, val);
	return this;
};

CalcManager.prototype.mod = function mod$1 (val, isExchange) {
	this.result = isExchange 
		? mod(val, this.result)
		: mod(this.result, val);
	return this;
};

CalcManager.prototype.extend = function extend (fn) {
		var rest = [], len = arguments.length - 1;
		while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	if (typeof fn === 'function') {
		this.result = fn.apply(void 0, [ this.result ].concat( rest ));
	}
	return this;
};

CalcManager.prototype.val = function val () {
	return Number(this.result || 0);
};

// Calc(1).add(1).val();
var Calc = function (v) { return new CalcManager(v); };

exports.Calc = Calc;
exports.RegEx = RegEx;
exports.Storage = Storage;
exports.URL = URL;
exports.Utils = Utils;
