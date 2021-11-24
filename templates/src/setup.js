import { setup } from '@wya/mp-framework';
import storeMiddleware, { mapActions } from '@wya/mp-store';
import { 
	net, navigatorMiddleware, shareMiddleware, queryMiddleware
} from './extends/index';

const request = net.ajax;

export default () => {
	setup({
		// 页面setup配置
		page: {
			$request: request,
			...mapActions(['request']),
			/**
			 * 注意：
			 * 中间件注册顺序为从前往后，但实际代理的方法的执行顺序是从后往前的
			 * 示例：middlewares: [A, B]，A、B均对onLoad进行代理，
			 * 则注册顺序：先注册 A，再注册 B，
			 * onLoad执行顺序：先执行 B 代理过的onLoad，再执行 A 代理过的 onLoad
			 */
			middlewares: [
				// 用于页面的中间件
				shareMiddleware,
				navigatorMiddleware,
				queryMiddleware,
				storeMiddleware
			]
		},
		// 组件setup配置
		component: {
			methods: {
				$request: request,
				...mapActions(['request']),
			},
			middlewares: [
				// 用于组件的中间件
				storeMiddleware
			]
		},
		provider() {
			return {
				config: {
					configA: 'a',
					configB: 'b',
					configC: 'c',
					configD: {
						d: 'd'
					},
					configE: [
						{ e: 'eee' },
						['1234']
					]
				}
			}
		}
	});
};