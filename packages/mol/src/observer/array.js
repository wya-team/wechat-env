import { def } from '../utils';

const PATCH_METHODS = [
	'shift',
	'unshift',
	'push',
	'pop',
	'sort',
	'splice',
	'reverse'
];

const arrayProto = Array.prototype;

export const arrayMethods = Object.create(arrayProto);

PATCH_METHODS.forEach(method => {
	const original = arrayProto[method];
	def(arrayMethods, method, function mutator(...args) {
		const result = original.apply(this, args);

		const ob = this.__ob__;

		let insertItems;

		switch (method) {
			case 'unshift':
			case 'push':
				insertItems = args;
				break;

			case 'splice':
				insertItems = args.slice(2);
				break;
			default:
				break;
		}

		insertItems && ob.observeArray(insertItems);
		ob.dep.notify();
		return result;
	});
});