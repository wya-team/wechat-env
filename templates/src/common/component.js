import storeMiddleware, { mapActions } from '@wya/mp-store';
import { Utils } from '@wya/mp-utils';
import net from '../utils/net';
import { showMiddleware } from './common';

let ComponentEnhancer = Utils.compose(
	showMiddleware,
	storeMiddleware,
	// 其他注入
)(Component);

export default function (opts = {}) {
	const { externalClasses = [], options, properties, methods, ...restOpts } = opts;
	if (!externalClasses.includes('custom-class')) {
		externalClasses.push('custom-class');
	}
	return ComponentEnhancer({
		...restOpts,
		options: {
			addGlobalClass: true,
			multipleSlots: true,
			...(options || {})
		},
		externalClasses,
		properties: {
			...(properties || {}),
			customStyle: String
		},
		methods: {
			...(methods || {}),
			$request: net.ajax,
			...mapActions(['request']),
			$emit(...args) {
				this.triggerEvent(...args);
			},
		}
	});
}
