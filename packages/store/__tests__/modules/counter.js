const initialState = {
	count: 0
};

const mutations = {
	INCREMENT(state, { data, param }) {
		state.count = state.count + 1;
	},

	DECREMENT(state, { data, param }) {
		state.count = state.count - 1;
	},

	FORCE_SETTING(state, { count }) {
		state.count = count;
	}
};

export const counter = {
	state: { ...initialState },
	mutations,
};

