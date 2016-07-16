import {
  REQUEST_LOGIN,
  RECEIVE_LOGIN,
  LOGIN_FAIL,
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function personReducer(state = initialState.personReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === REQUEST_LOGIN ||
    action.type === RECEIVE_LOGIN ||
    action.type === LOGIN_FAIL
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case REQUEST_LOGIN:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_LOGIN:
      obj.isReceiving = false;
      obj.person = action.person;
      return obj;
    case LOGIN_FAIL:
      obj.isReceiving = false;
    default:
      return state;
  }
}

export default personReducer;
