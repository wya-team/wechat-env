/**
 * 这是一个仅用于组件的mixin简易模板
 * 全局多处组件使用到的mixin可放在 mixins/component/xxx.js 中
 */
export default {
	props: {
		mixinProp: {
			type: String,
			value: 'prop from mixin'
		}
	},
	data: {
		mixinData: 'data from mixin'
	},
	attached() {
		console.log('attached form mixin');
	},
	methods: {
		mixinMethod() {
			// 
		}
	},
};