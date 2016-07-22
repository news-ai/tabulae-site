import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  REQUEST_LISTS_FAIL
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function listReducer(state = initialState.listReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === REQUEST_LISTS ||
    action.type === RECEIVE_LISTS ||
    action.type === REQUEST_LISTS_FAIL
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case REQUEST_LISTS:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_LISTS:
      obj.isReceiving = false;
      obj.lists = action.lists;
      return obj;
    case LOGIN_FAIL:
      obj.isReceiving = false;
    default:
      return state;
  }
}

export default listReducer;
