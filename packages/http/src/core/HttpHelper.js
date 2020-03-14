class HttpHelper {
	constructor(options = {}) {
		this.requests = [];
	}

	add(opts = {}) {
		const { request, options, cancel } = opts;

		this.requests.push({
			request,
			options,
			cancel
		});
	}

	remove(request) {
		this.requests = this.requests.filter(i => i.request !== request);
	}

	cancel(request) {
		const { cancel } = this.requests.find(i => i.request === request) || {};

		this.remove(request);
		
		cancel && cancel();
	}

	cancelAll(request) {
		this.requests.forEach(({ cancel }) => cancel());

		this.requests = [];
	}
}

export default new HttpHelper();
