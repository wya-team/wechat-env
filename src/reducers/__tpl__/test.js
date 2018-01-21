import * as types from '../../constants/actions/__tpl__';
const initialState = {
	isFetching: 0,
	count: 0,
	title: "加载????????"
};
export const tplTest = (state = initialState, action) => {
	switch (action.type) {
		case types.TPL_TEST_CLICK_GET + '_SUCCESS':
			state = {
				isFetching: 1,      // 是否已经获取 
				title: action.data.title
			};
			return state;
		case types.TPL_TEST_CLICK_CLICK:
			state.count = action.count;
			return state;
		case types.TPL_TEST_CLICK_POST + '_SUCCESS':
			state.count = action.param.count;
			return state;
		default:
			return state;
	}
};