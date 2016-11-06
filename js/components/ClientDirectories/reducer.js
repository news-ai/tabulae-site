import * as constants from './constants';
import values from 'lodash/values';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../utils/assign';
const types = values(constants);

function clientReducer(state = initialState.clientReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case constants.CLIENT_NAMES_REQUEST:
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case constants.CLIENT_NAMES_RECEIVED:
      obj.isReceiving = false;
      obj.didInvalidate = false;
      obj.clientnames = action.clientnames;
      return obj;
    case constants.CLIENT_NAMES_REQUEST_FAIL:
      obj.didInvalidate = true;
      obj.isReceiving = false;
      return obj;
    default:
      return state;
  }
}

export default clientReducer;
