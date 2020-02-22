const { expect } = require('chai');

const { createStore, combineReducers } = require('../src/redux');
const counter = require('./reducers/counter').default;
const connect = require('../src/index').default;

const reducer = combineReducers({
	counter
});

global.getApp = () => ({
	store: createStore(reducer)
});

describe('@wya/mp-store', () => {
	it('basic', () => {
		let config = connect((state) => state.counter)({});

		config.onLoad();
		console.log(config);
	});
});