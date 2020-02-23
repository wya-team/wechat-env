class Page {
	constructor(opts = {}) {

		Object.defineProperty(this, 'options', {
			value: {
				onLoad() {},
				onUnload() {},
				data: {},
				...opts
			},
			writable: true
		});

		this.data = {};
	}

	// 初始化
	open() {
		this.data = this.options.data;
		this.options.onLoad.call(this);
	}

	close() {
		this.options.onUnload.call(this);
	}

	setData(newV) {
		this.data = {
			...this.data,
			...newV
		};
	}
}
module.exports = (userOptions) => new Page(userOptions);



