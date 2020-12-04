const initialState = {
	user: 'a-sub-wya-team'
};

const mutations = {
	A_SUB_HOME_MAIN_POST_SUCCESS(state, { data, param }) {
		state.user = data.user;
	},

	A_SUB_HOME_MAIN_CHANGE_USER(state, { user }) {
		state.user = user;
	}
};

export const aSubHomeMain = {
	state: { ...initialState },
	mutations,
};