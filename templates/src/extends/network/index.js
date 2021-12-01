import Mol from '@wya/mol';
import createHttp from './http';
import API_ROOT from '../../stores/apis/root';

let app;
const _getApp = () => {
	app = app || getApp();
	return app;
};

const net = createHttp({
	apis: API_ROOT,
	// 无需登录的接口
	escapeLoginUrls: [],
	isAuthorized: () => {
		const { userData } = _getApp();
		return !!(userData && userData.token);
	},
	authorize: () => {
		return Mol.authorizeManager.codeLogin();
	},
	// 请求全局headers
	headers: () => {
		return {
			token: _getApp().userData.token
		};
	},
	// 请求全局参数
	async param(reqOptions) {
		return new Promise(async resolve => {
			// reqOptions.location为'accurate'时使用准确定位
			const location = reqOptions.location
				? await Mol.locationManager.get({ accurate: reqOptions.location === 'accurate' }) || {}
				: {};
			// 【BUSINESS】其它全局参数可以在此处添加
			resolve({ ...location });
		});
	}
});

export {
	net
};