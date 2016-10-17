import {instagramProfileConstant} from './constants';
import _ from 'lodash';

import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../../utils/assign';
const types = _.values(instagramProfileConstant);

function instagramProfileReducer(state = initialState.instagramProfileReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case instagramProfileConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case instagramProfileConstant.RECEIVE:
      obj[action.contactId] = action.profile;
      obj.isReceiving = false;
      return obj;
    case instagramProfileConstant.REQUEST_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default instagramProfileReducer;
