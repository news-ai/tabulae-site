import {
  searchConstant,
  SEARCH_CLEAR_CACHE
} from './constants';
import _ from 'lodash';

import { initialState } from '../../reducers/initialState';
import { assignToEmpty, canAccessReducer } from '../../utils/assign';
const types = _.values(searchConstant);
types.push(SEARCH_CLEAR_CACHE);

function searchReducer(state = initialState.searchReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case searchConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case searchConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.contacts);
      obj.isReceiving = false;
      obj.received = [...state.received, ...action.ids.filter(id => !state.received.some(rId => rId === id))];
      obj.query = action.query;
      return obj;
    case searchConstant.REQUEST_MULTIPLE_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case searchConstant.SET_OFFSET:
      obj.offset = action.offset;
      return obj;
    case SEARCH_CLEAR_CACHE:
      obj.received = [];
      obj.offset = 0;
      return obj;
    default:
      return state;
  }
}

export default searchReducer;
