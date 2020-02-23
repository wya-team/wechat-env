export const REGEX_RULES = {
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