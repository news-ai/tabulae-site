import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  REQUEST_LIST,
  RECEIVE_LIST,
  REQUEST_LISTS_FAIL,
  ADDED_CONTACT
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function listReducer(state = initialState.listReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === REQUEST_LISTS ||
    action.type === RECEIVE_LISTS ||
    action.type === REQUEST_LIST ||
    action.type === RECEIVE_LIST ||
    action.type === REQUEST_LISTS_FAIL ||
    action.type === ADDED_CONTACT
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
    case REQUEST_LISTS_FAIL:
      obj.isReceiving = false;
      return obj;
    case REQUEST_LIST:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_LIST:
      obj.isReceiving = false;
      obj[action.listId] = action.list;
      obj[action.listId].temp = [];
      return obj;
    case ADDED_CONTACT:
      console.log(action);
      obj[action.listId].temp = [ ...state[action.listId].temp, action.contactId];
      return obj;
    default:
      return state;
  }
}

export default listReducer;
