const initialState = {
	user: 'wya-team'
};

const mutations = {
	HOME_MAIN_POST_SUCCESS(state, { data, param }) {
		state.user = data.user;
	},

	HOME_MAIN_CHANGE_USER(state, { user }) {
		state.user = user;
	}
};

export const homeMain = {
	state: { ...initialState },
	mutations,
};