/**
 * 不使用redux
 */
import Promise from '../../libs/promise';
import net from '../../utils/net';
import { getItem, setItem, delItem, showAnimate, hideAnimate } from '../../utils/utils';
import API_ROOT from '../../constants/apiRoot';
const tplConfig = {
	$tplPopup(options){
		return new Promise((resolve, reject) => {
			this.$tplResolve  = resolve;
			this.$tplReject = reject;
			let param = {};
			net.ajax({
				url: API_ROOT['_TPL_LIST_GET'],
				type: 'GET',
				param,
				localData: {},
				success: (res) => {
					this.setData({
						$tpl: {
							isShow: 1
						},
						$tplOptions: options,
						$tplData: res.data,
						$tplAnimation: showAnimate(),
					});
				},
				error: (res) => {
					this.$toastInfo(res.msg);
					this.$tplResolve  = null;
					this.$tplReject = null;
				}
			});
		});
	},
	$tplClose(event){
		if (event.target.id == "close"){
			this.$tplHide();
		}
	},
	$tplHide(type, res){
		this.setData({
			$tpl: {
				isShow: 0
			},
			$tplAnimation: hideAnimate()
		});
		if (type) {
			this.$tplResolve(res);
			return;
		}
		this.$tplReject(res);
	},
	$tplHandleClick(){
		this.$tplHide(1, { title: '啦啦啦' });
	}
};
export default tplConfig;