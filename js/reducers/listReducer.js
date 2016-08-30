import {
  listConstant,
  SET_OFFSET
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';
import { canAccessReducer } from './utils';
import _ from 'lodash';

const types = _.values(listConstant);
types.push(
  SET_OFFSET
  );

function listReducer(state = initialState.listReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case listConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE_MULTIPLE:
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
      obj[action.list.id].receivedAt = Date.now();
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
