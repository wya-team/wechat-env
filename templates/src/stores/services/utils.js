import { Storage } from '@wya/mp-utils';
import { isEqualWith } from '../../utils/util';
import net from '../../utils/net';

export const serviceObj = {
	param: {},
	res: undefined
};

export const serviceCompare = (newParam, localObj) => {
	return isEqualWith(newParam, localObj.param)
		? localObj.res
		: undefined;
};

export const serviceManager = {
	cbs: [],
	add(cb) {
		this.cbs.push(cb);
	},
	clear() {
		this.cbs.forEach(cb => cb());
		this.cbs = [];
	}
};

export const createService = (defaultOptions = {}) => {
	const {
		key,
		url,
		parser = null,
		compare = null,
		cache = false,
		vuex = false,
		param: defaultParam = {},
		getParam = (instance) => ({}),
	} = defaultOptions;
	let store;
	cache && (store = Storage.get(`${key}`));
	store = store || { ...serviceObj };

	// clear
	!cache && serviceManager.add(() => {
		store = { ...serviceObj };
	});


	return {
		[key]: (userOptions = {}) => {
			const { param: userParam = {} } = userOptions;
			const options = { ...defaultOptions, ...userOptions };
			const { autoLoad = true, autoClear = false } = options;
			// 方法首字母大写
			const strFn = key.charAt(0).toUpperCase() + key.slice(1);

			const loadKey = `load${strFn}`;
			const clearKey = `clear${strFn}`;
			const loadingKey = `loading${strFn}`;

			return Behavior({
				data: {
					[key]: (store.res || {}).data || [],
					[loadingKey]: false
				},
				lifetimes: {
					attached() {
						autoLoad && (this[loadKey])({
							...defaultParam,
							...userParam,
							...getParam(this)
						});
					},
					detached() {
						autoClear && this[clearKey]();
					}
				},
				methods: {
					[loadKey](param, opts = {}) { // eslint-disable-line
						this[loadingKey] = true;
						return net.ajax({
							url, // 必须是mutationType
							type: 'GET',
							localData: compare ? compare(param, store) : serviceCompare(param, store),
							loading: false,
							param,
							...opts
						}).then((res) => {
							store = {
								param,
								res
							};
							this.setData({
								[key]: parser ? parser(store.res.data) : store.res.data
							});
							typeof cache === 'function' ? cache(key, store) : cache && Storage.set(`${key}`, store);
							return res;
						}).catch((res) => {
							return Promise.reject(res);
						}).finally(() => {
							this.setData({
								[loadingKey]: false
							});
						});
					},
					[clearKey]() {
						store = { ...serviceObj };
					}
				}
			});
		}
	};
};
