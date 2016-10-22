import {twitterDataConstant} from './constants';
import _ from 'lodash';

import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../../utils/assign';
const types = _.values(twitterDataConstant);

function twitterDataReducer(state = initialState.twitterDataReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case twitterDataConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case twitterDataConstant.RECEIVE:
      const oldContact = state[action.contactId] || {received: []};
      obj[action.contactId] = assignToEmpty(
        state[action.contactId], {
          received: [
            ...action.data.reverse(),
            ...oldContact.received,
          ],
          offset: action.offset
        });
      obj.isReceiving = false;
      return obj;
    case twitterDataConstant.REQUEST_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default twitterDataReducer;
