import storeMiddleware, { mapActions } from '@wya/mp-store';
import { Utils } from '@wya/mp-utils';
import net from '../utils/net';
import { navigatorMiddleware } from './common';

let PageEnhancer = Utils.compose(
	navigatorMiddleware,
	storeMiddleware,
	// 其他注入
)(Page);
export default (options = {}) => {
	const { share, onShareAppMessage, ...rest } = options;
	let opts = {
		$request: net.ajax,
		...mapActions(['request']),
		...rest,
	};
	if (share || onShareAppMessage) {
		opts.onShareAppMessage = function (opt) {
			let title = '';
			let imageUrl;
			let path;
			let query;

			if (onShareAppMessage) {
				const it = onShareAppMessage.call(this, opt) || {};
				title = it.title;
				imageUrl = it.imageUrl;
				path = it.path;
			}

			if (path) {
				const it = URL.parse(path);
				path = it.path;
				query = it.query;
			} else {
				let page = getCurrentPages().pop();
				path = page.route;
				query = page.options;
			}

			// 这里可以带全局的参数
			path = URL.merge({ path, query });
			return {
				title,
				path,
				imageUrl
			};
		};
	}
	return PageEnhancer(opts);
};
