import * as types from '../constants/actions/__tpl__';
/**
 * 引入共用的action
 * ajax
 */
export { request } from './_common/request';
/**
 * 初始化数据
 */
export const initMain = (id) => {
	return { 
		type: types.TPL_MAIN_INIT,
		id: id || Date.now()
	};
};

export const testClick = (count) => {
	return { 
		type: types.TPL_TEST_CLICK_CLICK, 
		count
	};
};
