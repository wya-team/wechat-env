/**
 * 不使用redux
 * this.$toastInfo("1",1.5,()=>{});
 */
const toastConfig = {
	$toastTime: null,
	$toastInfo(title, duration, cb){
		clearTimeout(this.$toastTime);
		this.setData({
			$toast: {
				isShow: 1,
				title
			}
		});
		this.$toastTime = setTimeout(() => {
			this.$toastHide(cb);
		}, duration * 1000 || 1500);
	},
	$toastHide(cb){
		clearTimeout(this.$toastTime);
		this.setData({
			$toast: {
				isShow: 0
			}
		});
		typeof cb == "function" && cb();
	}
};
export default toastConfig;