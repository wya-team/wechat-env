import { RegEx } from '@wya/mp-utils';
import _common from './_common';
import logs from './logs';
import index from './index';

const API = {
	..._common,
	...logs,
	...index
};

let baseUrl;

/* global __DEV__ */
if (false) { // eslint-disable-line
	baseUrl = 'https://gateway.wyawds.com';
} else {
	// 生产环境
	baseUrl = 'https://gateway.wyawds.com';
}
for (let i in API) {
	if (RegEx.URLScheme.test(API[i])) {
		API[i] = API[i];
	} else {
		API[i] = baseUrl + API[i];
	}
}
export default API;
