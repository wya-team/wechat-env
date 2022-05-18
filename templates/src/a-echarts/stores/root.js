import APIManager from '../../stores/apis/root';
import apis from './apis/root';

export default class Store {
	static init() {
		APIManager.inject(apis);
	}
}
