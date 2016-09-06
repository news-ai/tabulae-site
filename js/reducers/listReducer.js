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
      let unarchivedLists = [];
      let archivedLists = [];
      action.ids.map(id => {
        const list = action.lists[id];
        if (!list.archived) unarchivedLists.push(list);
        if (list.archived) archivedLists.push(list);
      });
      obj = assignToEmpty(state, action.lists);
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(listId => listId === id)));
      obj.lists = unarchivedLists;
      obj.archivedLists = archivedLists;
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
