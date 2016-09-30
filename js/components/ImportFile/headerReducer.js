import {
  headerConstant
} from './constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../utils/assign';
import _ from 'lodash';

const types = _.values(_.values(headerConstant));


function headerReducer(state = initialState.headerReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case headerConstant.REQUEST:
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case headerConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.listId] = action.headers;
      return obj;
    case headerConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default headerReducer;
