import {
  searchConstant
} from './constants';
import _ from 'lodash';

import { initialState } from '../reducers/initialState';
import { assignToEmpty, canAccessReducer } from '../utils/assign';
const types = _.values(searchConstant);

function searchReducer(state = initialState.searchReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case searchConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      return obj;
    case searchConstant.RECEIVE_MULTIPLE:
      obj.isReceiving = false;
      return obj;
    case searchConstant.REQUEST_MULTIPLE_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    default:
      return state;
  }
}

export default searchReducer;
