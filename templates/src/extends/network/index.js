import createHttp from './http';
import dola from '@wya/mp-framework'

let app;
const _getApp = () => {
	app = app || getApp();
	return app;
};

const net = createHttp({
	headers: () => {
		return {
			token: _getApp().userData.token
		};
	},
	isAuthorized: () => {
		const { userData } = _getApp();
		return !!(userData && userData.token);
	},
	authorize: () => {
		return dola.authorizeManager.codeLogin();
	},
	// 无需登录的接口
	escapeLoginUrls: []
});

export {
	net
};