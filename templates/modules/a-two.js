module.exports = [
	// 首页
	{
		path: "/home/main",
		name: "首页详情",
		template: ['scroll', 'basic']
	}
].map(i => {
	i.packageName = 'a-two';
	return i;
});