const initialState = {
	user: 'wya-team'
};

const mutations = {
	EXTRA_WEB_GET_SUCCESS(state, { data, param }) {
		state.user = data.user;
	}
};

export const extraWeb = {
	state: { ...initialState },
	mutations,
};