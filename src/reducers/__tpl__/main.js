import * as types from '../../constants/actions/__tpl__';
// import { assign } from '../../libs/assign.js';
import { ROUTER_CHANGE } from '../../constants/actions/_common';
import { initItem, initObj } from '../../utils/utils'; 
// const notShadowObj = JSON.stringify(initObj);
const initialState = {
	info: {},
	list: {}
};
export const tplMain = (state = initialState, action) => {
	let curId, items, type, curPage, totalPage, isEnd, _count, good_percent, star;
	switch (action.type) {
		case types.TPL_MAIN_INIT:
			curId = action.id;
			// state.curId = curId || "undefined";
			// state.info[curId] = {};
			// state.list[curId] = assign({}, JSON.parse(notShadowObj));
			state = {
				...state,
				curId: curId || "undefined",
				info: {
					...state.info,
					[curId]: {}
				},
				list: {
					...state.list,
					[curId]: {
						...initObj
					}
				}
			};
			return state;
		case types.TPL_MAIN_GET + '_SUCCESS':
			curId = state.curId;
			// state.info[curId]._count = action.data._count;
			// state.info[curId].good_percent = action.data.good_percent;
			// state.info[curId].star = action.data.star;
			state = {
				...state,
				curId: curId || "undefined",
				info: {
					...state.info,
					[curId]: {
						...state.info[curId],
						_count: action.data._count,
						good_percent: action.data.good_percent,
						star: action.data.star
					}
				}
			};
			return state;
		case types.TPL_MAIN_LIST_GET + '_ON':
			curId = state.curId;
			// state.list[curId].isEnd = 1;
			state = {
				...state,
				list: {
					...state.list,
					[curId]: {
						...state.list[curId],
						isEnd: 1
					}
				}
			};
			return state;
		case types.TPL_MAIN_LIST_GET + '_SUCCESS':
			// curPage = action.data.curPage;
			curId = state.curId;
			curPage = state.list[curId].curPage + 1;
			totalPage = action.data.totalPage;
			items = initItem(action.data.list);
			// state.list[curId].curPage = curPage;
			// state.list[curId].totalPage = totalPage;
			// state.list[curId].itemArr = [...state.list[curId].itemArr, ...items.itemArr];
			// state.list[curId].itemObj = assign({}, state.list[curId].itemObj, items.itemObj);
			// state.list[curId].isEnd = curPage + 1 > totalPage ? 2 : 0;
			state = {
				...state,
				list: {
					...state.list,
					[curId]: {
						...state.list[curId],
						curPage,
						totalPage,
						itemArr: [...state.list[curId].itemArr, ...items.itemArr],
						itemObj: {
							...state.list[curId].itemObj,
							...items.itemObj
						},
						isEnd: curPage + 1 > totalPage ? 2 : 0
					}
				}
			};
			return state;
		case types.TPL_MAIN_LIST_GET + '_ERROR':
			curId = state.curId;
			// state.list[curId].isEnd = 3;
			state = {
				...state,
				list: {
					...state.list,
					[curId]: {
						...state.list[curId],
						isEnd: 3
					}
				}
			};
			return state;
		default:
			return state;
	}
};