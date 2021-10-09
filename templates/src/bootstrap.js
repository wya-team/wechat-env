import { bootstrap } from './framework/index';
import { net, navigatorMiddleware, shareMiddleware } from './extends/index';

export default () => {
	bootstrap({
		// 页面bootstrap配置
		page: {
			request: net.ajax,
			middlewares: [
				// 用于页面的中间件
				shareMiddleware,
				navigatorMiddleware
			]
		},
		// 组件bootstrap配置
		component: {
			request: net.ajax,
			middlewares: [
				// 用于组件的中间件
			]
		}
	});
};