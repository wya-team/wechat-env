import storeMiddleware, { mapActions } from '@wya/mp-store';
import { Utils } from '@wya/mp-utils';
import net from '../utils/net';

let PageEnhancer = Utils.compose(
	storeMiddleware,
	// 其他注入
)(Page);
export default function (options = {}) {
	return PageEnhancer({
		onShareAppMessage() {
			return {
				title: ''
			};
		},
		$request: net.ajax,
		...mapActions(['request']),
		...options
	});
}
