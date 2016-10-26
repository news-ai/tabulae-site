import {
  listConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL,
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';
import { canAccessReducer } from './utils';
import _ from 'lodash';

const types = _.values(listConstant);
types.push(
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_REQUEST,
  'CLEAR_LIST_SEARCH'
  );

function listReducer(state = initialState.listReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let unarchivedLists = [];
  let archivedLists = [];
  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case 'CLEAR_LIST_REDUCER':
      obj = assignToEmpty(initialState.listReducer, {});
      return obj;
    case LIST_CONTACTS_SEARCH_REQUEST:
      obj.isReceiving = true;
      return obj;
    case LIST_CONTACTS_SEARCH_RECEIVED:
      obj[action.listId] = assignToEmpty(state[action.listId], {searchResults: action.ids});
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case 'CLEAR_LIST_SEARCH':
      obj[action.listId].searchResults = undefined;
      return obj;
    case listConstant.MANUALLY_SET_ISRECEIVING_ON:
      obj.isReceiving = true;
      return obj;
    case listConstant.MANUALLY_SET_ISRECEIVING_OFF:
      obj.isReceiving = false;
      return obj;
    case listConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.lists);
      action.ids.map(id => {
        if (state[id]) obj[id].offset = state[id].offset;
      });
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(listId => listId === id)));
      obj.received.map(id => {
        const list = obj[id];
        if (!list.archived) unarchivedLists.push(list.id);
        if (list.archived) archivedLists.push(list.id);
      });
      obj.lists = unarchivedLists;
      obj.archivedLists = archivedLists;
      obj.isReceiving = false;
      obj.didInvalidate = false;
      if (action.archivedOffset === undefined) obj.offset = action.offset;
      if (action.offset === undefined) obj.archivedOffset = action.archivedOffset;
      return obj;
    case listConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case listConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE:
      obj = assignToEmpty(state, action.list);
      obj.isReceiving = false;
      if (!state.received.some(id => id === action.id)) obj.received = [action.id, ...state.received];
      obj.received.map(id => {
        const list = obj[id];
        if (!list.archived) unarchivedLists.push(list.id);
        if (list.archived) archivedLists.push(list.id);
      });
      obj.lists = unarchivedLists;
      obj.archivedLists = archivedLists;
      obj[action.id].offset = 0;
      obj.didInvalidate = false;
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
