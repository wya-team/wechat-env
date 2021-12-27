import { noop } from '../utils';

const sharedPropertyDefinition = {
	enumerable: true,
	configurable: true,
	get: noop,
	set: noop
};

export const initProxy = Mol => {
	Mol.proxy = function (target, sourceKey, key) {
		sharedPropertyDefinition.get = function proxyGetter() {
		  return this[sourceKey][key];
		};
		sharedPropertyDefinition.set = function proxySetter(val) {
		  this[sourceKey][key] = val;
		};
		Object.defineProperty(target, key, sharedPropertyDefinition);
	};
};