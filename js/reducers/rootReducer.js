/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { combineReducers } from 'redux';

import personReducer from './personReducer';
import contactReducer from './contactReducer';

const rootReducer = combineReducers({
  personReducer,
  contactReducer
});

export default rootReducer;

