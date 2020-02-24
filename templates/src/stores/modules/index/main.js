const initialState = {
	user: 'wya-team'
};

const mutations = {
	INDEX_MAIN_POST_SUCCESS(state, { data, param }) {
		state.user = data.user;
	},

	INDEX_MAIN_CHANGE_USER(state, { user }) {
		state.user = user;
	}
};

export const indexMain = {
	state: { ...initialState },
	mutations,
};