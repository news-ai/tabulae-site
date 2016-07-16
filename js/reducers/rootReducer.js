/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { combineReducers } from 'redux';

import personReducer from './personReducer';

const rootReducer = combineReducers({
  personReducer
});

export default rootReducer;

