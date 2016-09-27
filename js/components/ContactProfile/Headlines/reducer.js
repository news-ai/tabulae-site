import {
  headlineConstant,
} from './constants';
import _ from 'lodash';

import {initialState} from '../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../utils/assign';
const types = _.values(headlineConstant);

function headlineReducer(state = initialState.headlineReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case headlineConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case headlineConstant.RECEIVE:
      obj = assignToEmpty(obj, action.headlines);
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
    case headlineConstant.REQUEST_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default headlineReducer;