const initialState = {
	user: 'wya-team'
};

const mutations = {
	EXTRA_ERROR_GET_SUCCESS(state, { data, param }) {
		state.user = data.user;
	}
};

export const extraError = {
	state: { ...initialState },
	mutations,
};