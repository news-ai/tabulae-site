import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  listConstant,
  SET_OFFSET
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function listReducer(state = initialState.listReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === REQUEST_LISTS ||
    action.type === RECEIVE_LISTS ||
    action.type === listConstant.REQUEST ||
    action.type === listConstant.RECEIVE ||
    action.type === listConstant.REQUEST_FAIL ||
    action.type === listConstant.PATCH ||
    action.type === listConstant.PATCH_FAIL ||
    action.type === SET_OFFSET
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case REQUEST_LISTS:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_LISTS:
      obj.isReceiving = false;
      let unarchivedList = [];
      let archivedList = [];
      action.lists.map( list => {
        obj[list.id] = list;
        if (!list.archived) unarchivedList.push(list);
        if (list.archived) archivedList.push(list);
      });
      obj.lists = unarchivedList;
      obj.archivedList = archivedList;
      return obj;
    case listConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case listConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.list.id] = action.list;
      obj[action.list.id].offset = 0;
      return obj;
    case listConstant.PATCH:
      obj.isReceiving = true;
      return obj;
    case listConstant.PATCH_FAIL:
      obj.isReceiving = false;
      return obj;
    case SET_OFFSET:
      obj[action.listId].offset = action.offset;
      return obj;
    default:
      return state;
  }
}

export default listReducer;
