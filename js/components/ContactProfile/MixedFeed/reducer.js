import {
  mixedConstant,
} from './constants';
import _ from 'lodash';

import {initialState} from '../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../utils/assign';
const types = _.values(mixedConstant);

function mixedReducer(state = initialState.mixedReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case mixedConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case mixedConstant.RECEIVE_MULTIPLE:
      const oldContact = state[action.contactId] || {received: []};
      obj[action.contactId] = assignToEmpty(state[action.contactId], {
        received: [
          ...oldContact.received,
          ...action.feed
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case mixedConstant.REQUEST_MULTIPLE_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default mixedReducer;
