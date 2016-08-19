import { loginConstant } from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function personReducer(state = initialState.personReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === loginConstant.REQUEST ||
    action.type === loginConstant.REQUEST_FAIL ||
    action.type === loginConstant.RECEIVE
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case loginConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case loginConstant.RECEIVE:
      obj.isReceiving = false;
      obj.person = action.person;
      return obj;
    case loginConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default personReducer;
