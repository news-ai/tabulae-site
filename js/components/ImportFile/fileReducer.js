import {
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT,
  fileConstant,
  headerConstant
} from './constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function fileReducer(state = initialState.fileReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case 'CLEAR_FILE_REDUCER':
      obj = assignToEmpty(initialState.fileReducer, {});
      return obj;
    case fileConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case fileConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case fileConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      // file belongs to list
      obj[action.listId] = action.file;
      return obj;
    case headerConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj[action.listId] = assignToEmpty(state[action.listId], {didInvalidate: false});
      return obj;
    case headerConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj[action.listId].headers = action.headers;
      return obj;
    case headerConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj[action.listId] = assignToEmpty(state[action.listId], {didInvalidate: true});
      return obj;
    case TURN_ON_PROCESS_WAIT:
      obj = assignToEmpty(state, {});
      obj.isProcessWaiting = true;
      return obj;
    case TURN_OFF_PROCESS_WAIT:
      obj = assignToEmpty(state, {});
      obj.isProcessWaiting = false;
      return obj;
    default:
      return state;
  }
}

export default fileReducer;
