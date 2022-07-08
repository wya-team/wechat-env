export default class Mol {
	static options = Object.create(null)

	// 记录当前处于激活状态的页面（当前展示的页面），只有一个
	static activePage = null

	constructor() {
		this._watchers = [];
		this._injectorWatcher = null;
	}

	$destroy() {
		// 拆除 watchers
		this._watchers.forEach(it => {
			it.teardown();
		});
	}
}