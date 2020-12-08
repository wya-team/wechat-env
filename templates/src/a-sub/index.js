/**
 * @file 用户映射，注册(初始化)
 */
import Page from '../common/page';
import Component from '../common/component';
import Store from './stores/root';

Store.init();

export { 
	Page,
	Component
};
