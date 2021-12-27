export default class Mol {
	static options = Object.create(null)

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