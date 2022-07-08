import Mol from '../class/mol';

/**
 * 初始化页面的 this.$query 以及 this.data.$query
 * @param {*} page 
 * @param {*} nativeQuery 
 */
export const initPageQuery = (page, nativeQuery) => {
	// 挂载 $query
	page.$query = nativeQuery;
	// 方便在 wxml 中使用 $query
	page.setData({ $query: nativeQuery });
};

/**
 * 初始化组件的 this.$query
 * @param {*} component 
 */
export const initComponentQuery = (component) => {
	Object.defineProperty(component, '$query', {
		enumerable: true,
		configurable: true,
		get() {
			// 代理到当前激活页面的 $query
			return Mol.activePage.$query;
		}
	});
};

/**
 * 更新页面及组件的 this.data.$query
 * @param {*} nativeVm 
 */
export const updateQueryData = (nativeVm) => {
	nativeVm.setData({ $query: Mol.activePage.$query });
};