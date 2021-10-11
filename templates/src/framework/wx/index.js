import promiseifyApi from './promiseify-api';
import bootstrapRouter from './router';

export default (context, options) => {
	const { promiseifyApis, ...rest } = options;
	// promise化api
	promiseifyApi(context, promiseifyApis);
	// 全局路由跳转配置
	bootstrapRouter(context, rest);
};
