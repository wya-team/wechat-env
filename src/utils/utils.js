import { assign } from '../libs/assign.js';
const isAvailable = (function isAvailableIffe() {
	const test = 'test';
	try {
		wx.setStorageSync(test, test);
		wx.removeStorageSync(test);
		return true;
	} catch (e) {
		return false;
	}
}());
/**
 * 设置缓存
 * @param key 保存的键值
 * @param val 保存的内容
 */
export const setItem = (key, val)  => {
	if (isAvailable) {
		wx.setStorageSync(key, val);
	}
};
/**
 * 获取缓存
 * @param  {[String]} key 获取的键值
 * @return {Object}
 */
export const getItem = (key) => {
	if (isAvailable) {
		return wx.getStorageSync(key);
	}
};
/**
 * 删除缓存
 * @param  {[String]} key 删除的键值
 */
export const delItem = (key)  => {
	if (isAvailable) {
		wx.removeStorageSync(key);
	}
};
/**
 * 解析url
 * @param  {String} routeName
 * @return {Object}
 */
export const parseUrl = (routeName) =>  { // 解析url
	let path = [];
	let pathName = [];
	const query = {};
	const queryArr = routeName.replace('/', '').split('?');
	path = queryArr[0].split('/');
	pathName = '/' + path.join('/');
	if (queryArr.length > 1) {
		queryArr[1].split('&').forEach(str => {
			const arr = str.split('=');
			const key = arr[0];
			const value = arr[1];
			if (isNaN(value)) {
				if (value == 'undefined' || value == 'null') {
					query[key] = undefined;
				} else {
					query[key] = value;
				}
			} else {
				query[key] = Number(value);
			}
		});
	}

	return {
		path,
		pathName,
		query
	};
};
/**
 * 初始化数据
 * @param  {String} res 传入的数据
 * @param  {String} id  数组是已str区分 ，默认'id'
 * @param  {String} _count  
 * @param  {Object} initObj 判断是否有init
 * @param  {Array} initArr 判断是否有init
 * @return {String} 
 * 参考reducers中的使用     
 */
export const initItem = (res, str, count, initObj, initArr)  => {
	let itemArr = [];
	let itemObj = {};
	let data;
	let id = str || 'id';
	if (typeof res == "object" && res.data && res.data instanceof Array) { // 传入的不是数组。res.data是数组
		data = res.data;
	} else if (res instanceof Array) { // 传入的是数组
		data = res;
	} else {
		return console.error('初始化参数错误');
	}
	for (let i = 0; i < data.length; i++) {
		itemArr = [...itemArr, data[i][id]];
		// itemObj = {
		// 	...itemObj,
		// 	[data[i][id]]: initObj || data[i]
		// };
		itemObj = assign({}, itemObj, {
			[data[i][id]]: initObj || data[i]
		});
	}
	/* 判断是否有_count*/
	if (count) {
		let {
			_count
		} = res;
		return {
			itemArr,
			itemObj,
			_count
		};
	} else {
		return {
			itemArr,
			itemObj
		};
	}
};
/**
 * 作为分页初始数据
 */
export const initObj = {
	curPage: 0, // 当前页数
	totalPage: 1, // 总页数
	pageSize: 10, // 条数
	isEnd: 0, // 是否正在加载 0 上拉加载，1为加载中，2为已全部加载,3数据异常
	itemArr: [],
	itemObj: {}
};
/**
 * show
 */
export const showAnimate = ()  => {
	let animation = wx.createAnimation({
		duration: 600,
		timingFunction: 'easa-in',
	});
	animation.top(0).step();
	// animation.backgroundColor("rgba(0,0,0,.5)").step();

	return animation.export();
};
export const hideAnimate = ()  => {
	let animation = wx.createAnimation({
		duration: 600,
		timingFunction: 'ease',
	});
	// animation.backgroundColor("rgba(0,0,0,0)").top("100vh").step();
	animation.top("100vh").step();
	return animation.export();
};

function validity(rule) {
	return rule.required ?
		obj[rule.type].regex.test(rule.value) :
		rule.value == "" || obj[rule.type].regex.test(rule.value);
}
let obj = {
	validNum: {
		regex: /^\d+(\.\d+)?$/,
		error: "请输入正确数字"
	},
	validId: {
		regex: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/,
		error: "身份证格式不正确"
	},
	validMobile: {
		regex: /^(13[0-9]|14[5|7]|15[^4]|17[0|3|6|7|8]|18[0-9])\d{8}$/,
		error: "请填写正确的手机号码"
	},
	validPostalCode: {
		regex: /^\d{4}$/,
		error: "请输入4位短信验证码"
	},
	validZipCode: {
		regex: /^\d{6}$/,
		error: "请输入6位邮政编码"
	},
	validWeChat: {
		regex: /^[a-zA-Z\d_]{5,}$/,
		error: "请输入正确的微信号"
	}
};
export const dataValidity = (rules)  => {
	let state = {
		status: !0
	};
	for (let i in rules) {
		let type = rules[i].type;
		if (typeof obj[type] == "undefined") {
			if (rules[i].required && rules[i].value == "") {
				state = {
					status: !1,
					error: rules[i].name + "必填",
					index: i
				};
				break;
			}
		} else if (!validity(rules[i])) {
			state = {
				status: !1,
				error: obj[type].error,
				index: i
			};
			break;
		}
	}
	return state;
};