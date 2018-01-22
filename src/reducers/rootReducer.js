import { combineReducers } from '../libs/redux.js';
// import { assign } from '../libs/assign.js';
import __tpl__ from './__tpl__/root';
const rootReducer = combineReducers({
	...__tpl__
});

export default rootReducer;