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
import templateReducer from '../components/Email/Template/reducer';
import searchReducer from '../components/Search/reducer';
import feedReducer from '../components/ContactProfile/reducer';
import headlineReducer from '../components/ContactProfile/Headlines/reducer';


const rootReducer = combineReducers({
  personReducer,
  contactReducer,
  listReducer,
  stagingReducer,
  publicationReducer,
  fileReducer,
  templateReducer,
  searchReducer,
  feedReducer,
  headlineReducer
});

export default rootReducer;

