let tplCount = {};
let tplList = {};
import { connect } from '../../libs/wechat-redux.js';
import { bindActionCreators } from '../../libs/redux.js';
import * as types from '../../constants/actions/__tpl__';
import * as creators from '../../actions/__tpl__';

import toastConfig from '../../components/toast/toast';

function mapStateToData(state) {
	return state.tplMain;
}

function mapDispatchToActions(dispatch) {
	return {
		actions: bindActionCreators(creators, dispatch)
	};
}
const pageConfig = {
	onLoad(query = {}){
		let {
			id = 1
		} = query;
		this.actions.initMain(id);
		const { curId } = this.data;
		if (!this.data.info[curId]._count) {
			this.loadData();
		}
		if (this.data.list[curId].curPage == 0) {
			this.actions.initMain(id);
			this.loadDataForScroll();
		};
	},
	loadData(){
		console.log(2);
		const {
			curId
		} = this.data;
		let url = types.TPL_MAIN_GET;
		let param = {
			id: curId
		};
		let params = {
			param: param,
			ajaxType: 'GET',
			onSuccess: (res) => {
			},
			onError: (res) => {
				this.$toastInfo(res.msg);
			}
		};
		this.actions.request(url, params, {});// 暂时使用模拟数据代替
	},
	loadDataForScroll(){
		const {
			curId,
			list
		} = this.data;
		const listInfo = list[curId];
		if (listInfo.isEnd > 0){ // 只有状态为0时才可以加载数据
			return false;
		}
		let url = types.TPL_MAIN_LIST_GET;
		let param = {
			id: curId,
			page: listInfo.curPage + 1
		};
		let params = {
			param: param,
			ajaxType: 'GET',
			onSuccess: (res) => {
				wx.stopPullDownRefresh();
			},
			onError: (res) => {
				this.$toastInfo(res.msg);
			}
		};
		this.actions.request(url, params, {});
	},
	// 下拉刷新
	onPullDownRefresh(){
		const {
			curId
		} = this.data;
		this.actions.initMain(curId);
		if (this.data.info[curId]) {
			this.loadData(curId);
		}
		if (this.data.list[curId].curPage == 0) {
			this.actions.initMain(curId);
			this.loadDataForScroll();
		};
	},
	// 上拉加载
	onReachBottom(){
		this.loadDataForScroll();
	},
	handleClick(event){
		const { curId, list } = this.data;
		const info = event.currentTarget.id.split("--");
		const src = info[0];
		const id = info[1];
		const { imgs } = list[curId].itemObj[id];
		wx.previewImage({
		    current: src,
		    urls: imgs
		});
	}
	
};
const combineConfig = Object.assign({}, pageConfig, toastConfig);
const resultConfig = connect(mapStateToData, mapDispatchToActions)(combineConfig);
Page(resultConfig);







