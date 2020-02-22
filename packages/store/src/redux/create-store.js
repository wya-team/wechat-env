export const ActionTypes = {
	INIT: '@@redux/INIT'
};

export default function createStore(reducer, preloadedState, enhancer) {
	if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
		enhancer = preloadedState;
		preloadedState = undefined;
	}

	if (enhancer) {
		return enhancer(createStore)(reducer, preloadedState);
	}

	let currentState = preloadedState;
	let currentReducer = reducer;
	let currentListeners = [];
	let nextListeners = currentListeners;
	let isDispatching = false;

	function ensureCanMutateNextListeners() {
		if (nextListeners === currentListeners) {
			nextListeners = currentListeners.slice();
		}
	}
	
	function subscribe(listener) {
		if (typeof listener !== 'function') {
			throw new Error('Expected listener to be a function.');
		}

		let isSubscribed = true;

		ensureCanMutateNextListeners();
		nextListeners.push(listener);

		return function unsubscribe() {
			if (!isSubscribed) {
				return;
			}

			isSubscribed = false;

			ensureCanMutateNextListeners();
			const index = nextListeners.indexOf(listener);
			nextListeners.splice(index, 1);
		};
	}

	function dispatch(action) {
		if (typeof action.type === 'undefined') {
			throw new Error(
				'Actions may not have an undefined "type" property. '
				+ 'Have you misspelled a constant?'
			);
		}

		if (isDispatching) {
			throw new Error('Reducers may not dispatch actions.');
		}

		try {
			isDispatching = true;
			currentState = currentReducer(currentState, action);
		} finally {
			isDispatching = false;
		}

		const listeners = currentListeners = nextListeners; // eslint-disable-line
		for (let i = 0; i < listeners.length; i++) {
			const listener = listeners[i];
			listener();
		}
	}

	function getState() {
		return currentState;
	}

	function replaceReducer(nextReducer) {
		if (typeof nextReducer !== 'function') {
			throw new Error('Expected the nextReducer to be a function.');
		}

		currentReducer = nextReducer;
		dispatch({ type: ActionTypes.INIT });
	}

	dispatch({ type: ActionTypes.INIT });

	return {
		subscribe,
		dispatch,
		getState,
		replaceReducer
	};
}