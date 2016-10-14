import {listfeedConstant} from './constants';
import _ from 'lodash';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../utils/assign';
const types = _.values(listfeedConstant);

function listfeedReducer(state = initialState.listfeedReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case listfeedConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case listfeedConstant.RECEIVE_MULTIPLE:
      const oldContact = state[action.listId] || {received: []};
      obj[action.listId] = assignToEmpty(state[action.listId], {
        received: [
          ...oldContact.received,
          ...action.feed
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      return obj;
    case listfeedConstant.REQUEST_MULTIPLE_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default listfeedReducer;
