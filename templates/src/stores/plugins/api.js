const createApi = (opts = {}) => store => {
	store.subscribeAction((action, state) => {
		if (action.type === 'ajax') {
			console.log(action, state);
		}
	});
};

export default createApi;