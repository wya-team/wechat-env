
import { connect } from '../../../libs/wechat-redux.js';
import { bindActionCreators } from '../../../libs/redux.js';
import * as types from '../../../constants/actions/__tpl__';
import * as creators from '../../../actions/__tpl__';
import toastConfig from '../../../components/toast/toast';

function mapStateToData(state) {
	return state.tplTest;
}

function mapDispatchToActions(dispatch) {
	return {
		actions: bindActionCreators(creators, dispatch)
	};
}
const pageConfig = {
	onLoad(query = {}){
		console.log('data', this.data);
		console.log('actions', this.actions);
		if (this.data.isFetching === 0) {
			this.loadData();
		}
	},
	onShow(){},
	loadData(){
		let url = types.TPL_TEST_CLICK_GET;
		let param = {};
		let params = {
			param: param,
			ajaxType: 'GET',
			onSuccess: (res) => {
				console.log(res);
			},
			onError: (res) => {
				this.$toastInfo(res.msg);
			}
		};
		this.actions.request(url, params, {});
	},
	handleClick(event){
		const type = event.currentTarget.id;
		let { count } = this.data;
		if (type == 'plus'){
			count++;
		} else {
			count--;
		}
		this.actions.testClick(count);
	},
	handleAsyncClick(event){
		const type = event.currentTarget.id;
		let { count } = this.data;
		if (type == 'plus'){
			count++;
		} else {
			count--;
		}
		let url = types.TPL_TEST_CLICK_POST;
		let param = {
			count
		};
		let params = {
			param: param,
			ajaxType: 'POST',
			onSuccess: (res) => {
				this.$toastInfo('与数据库同步成功');
			},
			onError: (res) => {
				this.$toastInfo(res.msg);
			}
		};
		this.actions.request(url, params, {});// 暂时使用模拟数据代替
	},
	handlePopup(event){
		const id = event.currentTarget.id;
		this.$testPopup({
			id
		}).then((res) => {
			this.$toastInfo('回调成功:' + res.title);
		}).catch((res) => {
			this.$toastInfo('回调失败');
		});
	}
};
const combineConfig = Object.assign({}, toastConfig, testConfig, pageConfig);
const resultConfig = connect(mapStateToData, mapDispatchToActions)(combineConfig);
Page(resultConfig);