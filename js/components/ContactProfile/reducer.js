import {
  feedConstant,
} from './constants';
import _ from 'lodash';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../utils/assign';
const types = _.values(feedConstant);

function feedReducer(state = initialState.feedReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case feedConstant.ADD_REQUESTED:
      obj.isReceiving = true;
      return obj;
    case feedConstant.ADD_RECEIVED:
      obj.isReceiving = false;
      return obj;
    case feedConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case feedConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.feeds);
      obj[action.contactId] = action.ids;
      obj.isReceiving = false;
      obj.received = [...state.received, ...action.ids.filter(id => !state[id])];
      return obj;
    default:
      return state;
  }
}

export default feedReducer;
