/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { combineReducers } from 'redux';

import personReducer from './personReducer';
import contactReducer from './contactReducer';
import listReducer from './listReducer';

const rootReducer = combineReducers({
  personReducer,
  contactReducer,
  listReducer
});

export default rootReducer;

