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
    case headlineConstant.ADD_REQUESTED:
      obj.isReceiving = true;
      return obj;
    case headlineConstant.ADD_RECEIVED:
      obj.isReceiving = false;
      return obj;
    case headlineConstant.REQUEST:
      obj[action.contactId] = {};
      obj[action.contactId].received = [];
      obj.isReceiving = true;
      return obj;
    case headlineConstant.RECEIVE:
      obj = assignToEmpty(obj, action.headlines);
      obj[action.contactId].received = [
      ...obj[action.contactId].received,
      ...action.ids.filter(id => !state[action.contactId][id])
      ];
      obj.isReceiving = false;
      return obj;
    default:
      return state;
  }
}

export default headlineReducer;