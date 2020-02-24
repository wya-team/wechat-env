/**
 * 中间件
 */
import { createLogger } from '@wya/mp-store';
import createApi from './plugins/api';

/**
 * 根级别
 */
import { actions } from './actions';
import { mutations } from './mutations';
import modules from './modules/root';

export const storeConfig = {
	plugins: [createApi()],
	actions,
	mutations,
	modules
};