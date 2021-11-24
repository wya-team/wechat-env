import { URL } from '@wya/mp-utils';

/**
 * 资源懒加载管理
 * 适用于如echarts等比较大的资源，不想让其占用主包大小，而将其单独放置于资源子包
 * 并且建议该子包仅做该资源分包用，不含其它业务，避免因加载该资源而必须加载其他可能目前不需要用到的代码资源
 * 设计方式：调用require获取资源 -> redirect进入子包指定页面 -> 子包调用add方法完成资源挂载 -> 重定向到调用require的页面
 * 
 * 获取资源如：mol.sourceManager.require('echarts')
 * 挂载资源如：mol.sourceManager.add('echarts', echarts)
 */
class SourceManager {
	constructor() {
		// 资源缓存
		this._cache = {};
	}

	require(source, opts = {}) {
		// 命中缓存直接返回缓存
		if (this._cache[source]) return this._cache[source]; 
		const { path = `/a-${source}/pages/load`, replace = true } = opts;
		const { route, options } = getCurrentPages().pop();
		replace && wx.redirectTo({
			url: URL.merge({
				path,
				query: {
					url: URL.merge({
						path: `/${route}`,
						query: options
					})
				}
			}),
		});
	}

	/**
	 * 挂载资源
	 * @param {*} sourceName 用于require的指定资源名
	 * @param {*} source 资源内容
	 */
	add(source, content) {
		this._cache[source] = content;
	}

}

const install = (context) => {
	context.sourceManager = new SourceManager();
};

export default install;
