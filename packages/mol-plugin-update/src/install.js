import { Utils } from '@wya/mp-utils';

const log = Utils.createLogger('UpdateManager');

/**
 * 应用更新管理
 */
class UpdateManager {
	static manager = null

	static watch() {
		if (this.manager || !Utils.canIUse('getUpdateManager')) return;
		
		this.manager = wx.getUpdateManager();

		this.manager.onCheckForUpdate(log);

		this.manager.onUpdateReady(() => { 
			wx.showModal({
				title: '更新提示',
				content: '新版本已准备就绪，是否重启应用？',
				success: (res) => {
					if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						this.manager.applyUpdate();
					}
				}
			});
		});

		this.manager.onUpdateFailed(log);
	}
}

const install = (context) => {
	context.updateManager = UpdateManager;
};
export default install;