import storeMiddleware, { mapActions } from '@wya/mp-store';
import { Utils } from '@wya/mp-utils';
import net from '../utils/net';

let ComponentEnhancer = Utils.compose(
	storeMiddleware,
	// 其他注入
)(Component);

export default function (options = {}) {
	
	return ComponentEnhancer({
		...options,
		methods: {
			...options.methods,
			$request: net.ajax,
			...mapActions(['request']),
		}
	});
}
