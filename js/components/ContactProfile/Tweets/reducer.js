import {tweetConstant} from './constants';
import _ from 'lodash';

import {initialState} from '../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../utils/assign';
const types = _.values(tweetConstant);

function tweetReducer(state = initialState.tweetReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case tweetConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case tweetConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(obj, action.tweets);
      const oldContact = state[action.contactId] || {received: []};
      obj[action.contactId] = assignToEmpty(state[action.contactId], {
        received: [
          ...oldContact.received,
          ...action.ids.filter(id => !oldContact[id])
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      return obj;
    case tweetConstant.REQUEST_MULTIPLE_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default tweetReducer;
