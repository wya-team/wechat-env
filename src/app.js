// app.js
import configureStore from './stores/configureStore';
import { initialState } from './stores/stores';
import { getItem, setItem, delItem } from './utils/utils';
const store = configureStore(initialState);
let obj = {};
let a = {};
obj = {
	...obj,
	...a
};
App({
	onLaunch() {
		delItem('sku_goods');
		delItem('sku_selected');
	},
	getUserInfo(cb) {
		const sessionId = getItem('sessionId') || null;
		if (!sessionId && !this.userInfo) {
			// 调用登录接口
			wx.login({
				success: (loginRes) => {
					wx.getUserInfo({
						success: (res) => {
							this.userInfo = res;
							this.userInfo.code = loginRes.code;
							typeof cb == "function" && cb(this.userInfo);
						}
					});
				}
			});
		} else {
			typeof cb == "function" && cb(this.userInfo, sessionId);
		}
	},
	getSystemInfo (cb){
		// 设备的长宽高
		if (!this.systemInfo) {
			wx.getSystemInfo({
				success: (res) => {
					this.systemInfo = res;
					typeof cb == "function" && cb(this.systemInfo);
				}
			});
		} else {
			typeof cb == "function" && cb(this.userInfo);
		}
	},
	systemInfo: null,
	userInfo: null,
	store
});