
export const setupNavigatorMixin = (Mol) => {
	Mol.pageMixin({
		/**
		 * 用于页面卸载时清除页面store数据
		 * 需在页面注册options中指定 navigator: 'XXX'，'XXX'对应store中名为 'XXX_ROUTE_CHANGE' 的mutation
		 */
		onUnload() {
			this.navigator && wx.nextTick(() => this.$store.commit(`${navigator}_ROUTE_CHANGE`));
		}
	});
};
