/**
 * 页面启动query参数解析
 * 某些场景如小程序码中携带的页面参数，由于长度存在限制，
 * 可以在将参数传给服务端，服务端将这些参数存储起来，同时生成一个唯一标识，将这个标识作为小程序码中的页面参数
 * 当扫描小程序码进入小程序时，需要通过该标识去请求服务端换取真实参数
 */
class QueryParser {
	// 解析过的缓存
	_cache = {};

	// 请求实例池
	_instancePool = {};

	constructor(Mol, options) {
		this._molCtx = Mol;
		this._sceneKey = options.sceneKey || 'scene';
		this._scene2Query = options.scene2Query;
	}

	parse(query, key) {
		// 没有传入有效query，则认为取当前页query，
		// 注意：如果在app.onShow中调用时需传入opts.query，因为此时可能页面栈还是[]
		if (!query) {
			const currentPage = getCurrentPages().pop();
			query = currentPage.options;
		}

		let sceneStr = query[this._sceneKey];

		const parseTask = (async () => {
			if (query[key]) {
				return query[key];
			}
			if (sceneStr) {
				sceneStr = decodeURIComponent(sceneStr);
				const cacheTarget = this._cache[sceneStr];

				if (cacheTarget) {
					return key ? cacheTarget[key] : { ...query, ...cacheTarget };
				}
				
				try {
					// 保证唯一实例
					if (!this._instancePool[sceneStr]) {
						this._instancePool[sceneStr] = this._scene2Query(sceneStr);
					}
					const res = await this._instancePool[sceneStr];
					// 缓存
					this._cache[sceneStr] = { ...query, ...res };
					this._instancePool[sceneStr] = null;
					return key ? res[key] : { ...this._cache[sceneStr] };
				} catch (error) {
					console.error('QueryParser 解析错误：', error);
					this._instancePool[sceneStr] = null;
					return key ? undefined : query;
				}
			}
			return query;
		})();
		this._molCtx.addPreprocessingTask(parseTask);
		return parseTask;
	}
}

const install = (Mol, opts) => {
	Mol.queryParser = new QueryParser(Mol, opts);
	Mol.pageMixin({
		/**
		 * 用于解析页面query，并给页面注入$query
		 */
		async beforeLoad(query) {
			// 需要等待的逻辑都可添加到生命周期等待任务中
			this.$query = await Mol.queryParser.parse(query);
		}
	});
};

export default install;