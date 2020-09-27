module.exports = [
	{
		path: "/login/auth",
		name: "授权登录",
		template: ['basic']
	},
	{
		path: "/login/mobile",
		name: "手机号登录",
		template: ['form']
	}		
].map(i => {
	i.packageName = 'pages';
	return i;
});