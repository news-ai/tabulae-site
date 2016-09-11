import {
  listConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';
import { canAccessReducer } from './utils';
import _ from 'lodash';

const types = _.values(listConstant);
types.push(
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_REQUEST
  );

function listReducer(state = initialState.listReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case LIST_CONTACTS_SEARCH_REQUEST:
      obj.isReceiving = true;
      obj[action.listId].searchResults = [];
      return obj;
    case LIST_CONTACTS_SEARCH_RECEIVED:
      obj.isReceiving = false;
      obj[action.listId].searchResults = action.ids;
      return obj;
    case listConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE_MULTIPLE:
      let unarchivedLists = [];
      let archivedLists = [];
      obj = assignToEmpty(state, action.lists);
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(listId => listId === id)));
      obj.received.map(id => {
        const list = obj[id];
        if (!list.archived) unarchivedLists.push(list.id);
        if (list.archived) archivedLists.push(list.id);
      });
      obj.lists = unarchivedLists;
      obj.archivedLists = archivedLists;
      obj.isReceiving = false;
      obj.offset = action.offset;
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
    case listConstant.SET_OFFSET:
      obj[action.listId].offset = action.offset;
      return obj;
    default:
      return state;
  }
}

export default listReducer;
