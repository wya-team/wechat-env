const initialState = {
	user: 'wya-team'
};

const mutations = {
	LOGS_MAIN_POST_SUCCESS(state, { data, param }) {
		state.user = data.user;
	}
};

export const logsMain = {
	state: { ...initialState },
	mutations,
};