import Mol from '@wya/mol';
import createHttp from './http';
import API_ROOT from '../../stores/apis/root';
import { getCurrentUrl } from '../../utils/index';

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
	},
	onFail({ response }) {
		switch (response.status) {
			case -1: // token无效，需静默授权
				getApp().silentLogin();
				break;

			case -2: // 需要授权头像、昵称
				// 业务处理
				
				break;

			case -3: // 需要授权手机号/登录
				getApp().$router.push(`/a-account/pages/login/channel?redirectUrl=${getCurrentUrl()}`);
				break;

			default:
				break;
		}
	}
});

export {
	net
};