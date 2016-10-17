import {twitterProfileConstant} from './constants';
import _ from 'lodash';

import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../../utils/assign';
const types = _.values(twitterProfileConstant);

function twitterProfileReducer(state = initialState.twitterProfileReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case twitterProfileConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case twitterProfileConstant.RECEIVE:
      obj[action.contactId] = action.profile;
      obj.isReceiving = false;
      return obj;
    case twitterProfileConstant.REQUEST_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default twitterProfileReducer;
