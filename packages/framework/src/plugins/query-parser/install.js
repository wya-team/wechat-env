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

	constructor(mol, options) {
		this._molCtx = mol;
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

		const parseTask = new Promise(async (resolve) => {
			if (query[key]) {
				resolve(query[key]);
				return;
			}
			if (sceneStr) {
				sceneStr = decodeURIComponent(sceneStr);
				const cacheTarget = this._cache[sceneStr];

				if (cacheTarget) {
					resolve(key ? cacheTarget[key] : { ...query, ...cacheTarget });
					return;
				}
				
				try {
					// 保证唯一实例
					if (!this._instancePool[sceneStr]) {
						this._instancePool[sceneStr] = this._scene2Query(sceneStr);
					}
					const res = await this._instancePool[sceneStr];
					// 缓存
					this._cache[sceneStr] = { ...query, ...res };
					resolve(key ? res[key] : { ...this._cache[sceneStr] });
					this._instancePool[sceneStr] = null;
				} catch (error) {
					console.log('error', error);
					resolve(key ? undefined : {});
					this._instancePool[sceneStr] = null;
				}
				return;
			}
			resolve(query);
		});
		this._molCtx.addLifecycleWaitingTask(parseTask);
		return parseTask;
	}
}

const install = (mol, opts) => {
	mol.queryParser = new QueryParser(mol, opts);
};

export default install;