import { mapActions } from '@wya/mp-store';
import { net } from '../network/index';

const request = net.ajax;

export const setupRequestMixin = (Mol) => {
	Mol.pageMixin({
		$request: request,
		...mapActions(['request']),
	});
	Mol.componentMixin({
		methods: {
			$request: request,
			...mapActions(['request']),
		},
	});
};
