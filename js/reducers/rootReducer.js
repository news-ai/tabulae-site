import {combineReducers} from 'redux';

import personReducer from '../components/Login/reducer';
import contactReducer from './contactReducer';
import listReducer from './listReducer';
import stagingReducer from '../components/Email/reducer';
import publicationReducer from './publicationReducer';
import fileReducer from '../components/ImportFile/fileReducer';
import headerReducer from '../components/ImportFile/headerReducer';
import templateReducer from '../components/Email/Template/reducer';
import searchReducer from '../components/Search/reducer';
import feedReducer from '../components/ContactProfile/reducer';
import headlineReducer from '../components/ContactProfile/Headlines/reducer';
import mixedReducer from '../components/ContactProfile/MixedFeed/reducer';
import tweetReducer from '../components/ContactProfile/Tweets/reducer';
import listfeedReducer from '../components/ListFeed/reducer';
import twitterProfileReducer from '../components/ContactProfile/SocialProfiles/Twitter/reducer';
import instagramProfileReducer from '../components/ContactProfile/SocialProfiles/Instagram/reducer';

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
  headlineReducer,
  headerReducer,
  mixedReducer,
  tweetReducer,
  listfeedReducer,
  twitterProfileReducer,
  instagramProfileReducer,
});

export default rootReducer;
