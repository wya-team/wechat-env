import { Storage } from '@wya/mp-utils';

/**
 * 筛选出用于接口请求中携带的参数
 */
const filter = data => [
	'latitude',
	'longitude',
	'country_id',
	'province_id',
	'city_id',
	'area_id'
].reduce((pre, cur) => {
	if (data[cur]) {
		pre[cur] = data[cur];
	}
	return pre;
}, {});

/**
 * 是否是有效的（合法的）location数据
 * @param {*} location 
 * @returns 
 */
const isLegal = location => !!(location && typeof location === 'object' && Object.keys(location).length);

// 1分钟的毫秒数
const ONE_MINUTE_MS = 60 * 1000;

/**
 * location管理
 */
class LocationManager {
	constructor(options) {
		this.cacheKey = options.cacheKey;
		this.config = options.config || {}; // getLocation的配置
		this.filter = options.filter || filter;
		this.lazyLocation = this._getLazyLocationFromCache();
		// 准确定位信息
		this.location = null;
		// 上次获取准确定位的时间
		this.locationUpdateAt = null;
	}

	_getLazyLocationFromCache() {
		return this.lazyLocation || Storage.get(this.cacheKey);
	}

	_updateLazy(data) {
		this.lazyLocation = data;
		Storage.set(this.cacheKey, data);
	}

	/**
	 * 更新准确的地理位置
	 * @param {*} data 
	 */
	_updateAccurate(data) {
		this.location = data;
		this.locationUpdateAt = Date.now();
	}

	/**
	 * 获取最新定位
	 * 异步，需要await
	 * @returns { latitude, longitude }
	 */
	getLocation({ timeout, ...obj } = {}) {
		const { success: successCb, fail: failCb, ...rest } = { ...this.config, ...obj };
		return new Promise((resolve, reject) => {
			let timer;
			const success = (result = {}) => {
				timer && clearTimeout(timer);
				const { latitude, longitude } = result;
				this._updateAccurate({ latitude, longitude });
				successCb && successCb(result);
				resolve({ latitude, longitude });
			};

			const fail = (e) => {
				console.log('定位获取失败');
				timer && clearTimeout(timer);
				failCb && failCb(e);
				resolve({});
			};

			timeout && (timer = setTimeout(fail, timeout));

			wx.getLocation({ ...rest, success, fail });
		});
	}

	/**
	 * 获取准确地理位置
	 * 1分钟内多次调用，使用缓存数据，不频繁获取定位（会增加设备耗电）
	 */
	getAccurate(locationConfig) {
		if (this.locationUpdateAt && Date.now() - this.locationUpdateAt <= ONE_MINUTE_MS && this.location) {
			return this.location;
		}
		return this.getLocation(locationConfig);
	}

	/**
	 * 获取lazyLlocation数据
	 */
	async getLazy(filter = false, locationConfig) {
		return new Promise(async resolve => {
			let location;
			try {
				const cacheData = this._getLazyLocationFromCache();
				if (isLegal(cacheData)) {
					location = cacheData;
				} else {
					location = await this.getLocation(locationConfig);
					this._updateLazy(location);
				}
			} catch (error) {
				location = {};
				console.log(error);
			}
			resolve(filter ? this.filter(location) : { ...location });
		});
	}

	get({ accurate = false, ...obj } = {}) {
		return accurate ? this.getAccurate(obj) : this.getLazy(true, obj);
	}
	
	/**
	 * 外部设置lazyLlocation数据
	 * @param {*} param0 
	 */
	set({ location }) {
		isLegal(location) && this._updateLazy(location);
	}

	/**
	 * 重置location数据（重新获取定位）
	 * 同时更新location和lazyLoaction
	 */
	async reset() {
		const location = await this.getLocation();
		this._updateLazy(location);
	}
}

const install = (Mol, options) => {
	Mol.locationManager = new LocationManager(options);
};

export default install;
