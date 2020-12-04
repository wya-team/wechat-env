import { RegEx } from '@wya/mp-utils';
import _common from './_common';
import extra from './extra';
import home from './home';

const API = {
	..._common,
	...extra,
	...home
};

class APIManager {
	constructor() {
		const baseUrl = process.env.NODE_ENV === 'development' 
			? 'https://apis.development.com'
			: 'https://apis.production.com';

		// this.baseUrl
		Object.defineProperty(this, 'baseUrl', {
			value: baseUrl,
			writable: false
		});

		// this.inject
		Object.defineProperty(this, 'inject', {
			value: this.inject,
			writable: false
		});

		if (process.env.NODE_ENV === 'development') {
			setTimeout(() => (getApp().APIManager = this), 1000);
		}
	}


	/**
	 * 用于异步的apis注入或者子包apis的注入
	 */
	inject(target) {
		for (let i in target) {
			if (process.env.NODE_ENV === 'development') {
				this[i] && console.warn(`[@stores/apis]: key重复注入 ${i}`);
			}

			this[i] = RegEx.URLScheme.test(target[i]) 
				? target[i]
				: this.baseUrl + target[i];
		}

		return this;
	}
}

export default new APIManager().inject(API);
