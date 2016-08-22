/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { combineReducers } from 'redux';

import personReducer from '../components/Login/reducer';
import contactReducer from './contactReducer';
import listReducer from './listReducer';
import stagingReducer from '../components/Email/reducer';
import publicationReducer from './publicationReducer';
import fileReducer from '../components/ImportFile/reducer';

const rootReducer = combineReducers({
  personReducer,
  contactReducer,
  listReducer,
  stagingReducer,
  publicationReducer,
  fileReducer
});

export default rootReducer;

