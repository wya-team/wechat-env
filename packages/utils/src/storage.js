const STORAGE_PERMISSION_ALLOW = (() => {
	const test = 'test';
	try {
		wx.setStorageSync(test, test);
		wx.removeStorageSync(test);
		return true;
	} catch (e) {
		return false;
	}
})();

class StorageManager {
	setVersion(version, clear, opts = {}) {
		this.version = version;

		if (!STORAGE_PERMISSION_ALLOW) return;
		// TODO 清除之前的缓存
	}

	/**
	 * 设置缓存
	 * @param key 保存的键值
	 * @param val 保存的内容
	 */
	set(key, val, opts = {}) {
		if (STORAGE_PERMISSION_ALLOW) {
			wx.setStorageSync(key, val);
		}
	}

	/**
	 * 获取缓存
	 * @param  {[String]} key 获取的键值
	 * @return {Object}
	 */
	get(key, opts = {}) {
		if (STORAGE_PERMISSION_ALLOW) {
			return wx.getStorageSync(key);
		}
	}

	/**
	 * 删除缓存
	 * @param  {[String]} key 删除的键值
	 */
	remove(key, opts = {}) {
		if (STORAGE_PERMISSION_ALLOW) {
			wx.removeStorageSync(key);
		}
	}
}

export const Storage = new StorageManager();