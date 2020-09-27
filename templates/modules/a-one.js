module.exports = [
	// 首页
	{
		path: "/home/main",
		name: "首页详情",
		template: ['scroll', 'tabs']
	}
].map(i => {
	i.packageName = 'a-one';
	return i;
});