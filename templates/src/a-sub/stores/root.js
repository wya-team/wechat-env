import APIManager from '../../stores/apis/root';
import modules from './modules/root';
import apis from './apis/root';

export default class Store {
	static init() {
		const { store } = getApp();
		APIManager.inject(apis);
		store.addModules(modules);
	}
}
	