/**
 * 这是一个仅用于页面的mixin简易模板
 * 全局多个page使用到的mixin可放在 mixins/page/xxx.js 中
 */
export default {
	data: {
		mixinData: 'data from mixin'
	},
	onLoad() {
		console.log('onLoad form mixin');
	},
	mixinMethod() {
		// 
	}
};