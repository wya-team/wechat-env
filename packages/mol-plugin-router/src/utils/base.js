import { URL } from '@wya/mp-utils';

export const noop = () => {};

const _toString = Object.prototype.toString;
export const isPlainObject = v => _toString.call(v) === '[object Object]';
