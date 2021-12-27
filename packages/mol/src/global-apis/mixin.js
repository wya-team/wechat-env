import {
	mergeAppOptions,
	mergePageOptions,
	mergeComponentOptions,
	normalizeComponentLifecycles
} from '../utils';

export const initMixin = Mol => {
	/**
	 * App混入
	 * @param {*} mixin 
	 * @returns 
	 */
	Mol.appMixin = function (mixin) {
		this.MolApp.options = mergeAppOptions(this.MolApp.options, mixin);
		return this;
	};

	/**
	 * 页面混入
	 * @param {*} mixin 
	 * @returns 
	 */
	Mol.pageMixin = function (mixin) {
		this.MolPage.options = mergePageOptions(this.MolPage.options, mixin);
		return this;
	};

	/**
	 * 组件混入
	 * @param {*} mixin 
	 * @returns 
	 */
	Mol.componentMixin = function (mixin) {
		normalizeComponentLifecycles(mixin);
		this.MolComponent.options = mergeComponentOptions(this.MolComponent.options, mixin);
		return this;
	};
};