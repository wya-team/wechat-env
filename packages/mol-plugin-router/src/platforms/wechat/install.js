const install = (Mol) => {
	Mol.appMixin({
		beforeLaunch() {
			Mol.proxy(this, '$mol', '$router');
		}
	});
	Mol.pageMixin({
		beforeCreate() {
			Mol.proxy(this, '$mol', '$router');
		}
	});
	Mol.componentMixin({
		beforeCreate() {
			Mol.proxy(this, '$mol', '$router');
		}
	});

	Object.defineProperty(Mol.prototype, '$router', {
		get() {
			return this.$options.router;
		}
	});
};

export default install;