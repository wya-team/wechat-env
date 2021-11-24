import { observe } from '../observer/index';

export default class Provider {
	constructor(data = {}) {
		this.data = null;
		this.set(data, true);
	}

	get(key) {
		return key ? this.data[key] : this.data;
	}

	set(patchData = {}, override = false) {
		if (override) {
			this.data = patchData;
		} else {
			Object.entries(patchData).forEach(([key, value]) => {
				this.data[key] = value;
			});
		}
		observe(this.data);
	}
}
