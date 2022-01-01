/**
 * 这是一个页面和组件内均使用的mixin简易模板
 * 全局多处页面和组件使用到的mixin可放在 mixins/_common/xxx.js 中
 * 注意，此时mixin的方法需要放在methods中
 */
export default {
	data: {
		mixinData: 'data from mixin'
	},
	methods: {
		mixinMethod() {
			// 
		}
	},
};