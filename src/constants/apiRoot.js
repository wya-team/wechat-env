import { DEV_WITH_SERVER } from './constants';
import __tpl__ from './api/__tpl__';
import _common from './api/_common';


const API = Object.assign({},
	__tpl__,
	_common
);
let baseUrl;
if (!DEV_WITH_SERVER) {
	// 开发环境-前端自模拟
	baseUrl = 'http://localhost:3000';
} else {
	// 开发环境-后端数据
	// baseUrl = 'http://api.wds.com';
	baseUrl = 'https://wxapi.weiyian.com';
}
for (let i in API) {
	API[i] = baseUrl + API[i];
}
export default API;