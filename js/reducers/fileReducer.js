import {
  UPLOAD_FILE,
  UPLOAD_FILE_FAIL,
  RECEIVE_FILE,
  REQUEST_HEADERS,
  RECEIVE_HEADERS,
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function fileReducer(state = initialState.fileReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === UPLOAD_FILE ||
    action.type === UPLOAD_FILE_FAIL ||
    action.type === RECEIVE_FILE ||
    action.type === REQUEST_HEADERS ||
    action.type === RECEIVE_HEADERS ||
    action.type === TURN_OFF_PROCESS_WAIT ||
    action.type === TURN_ON_PROCESS_WAIT
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case UPLOAD_FILE:
      obj.isReceiving = true;
      return obj;
    case UPLOAD_FILE_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case RECEIVE_FILE:
      obj.isReceiving = false;
      // file belongs to list
      obj[action.listId] = action.file;
      return obj;
    case REQUEST_HEADERS:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_HEADERS:
      obj.isReceiving = false;
      if (!obj[action.listId]) obj[action.listId] = {};
      obj[action.listId].headers = action.headers;
      return obj;
    case TURN_ON_PROCESS_WAIT:
      obj.isProcessWaiting = true;
      return obj;
    case TURN_OFF_PROCESS_WAIT:
      obj.isProcessWaiting = false;
      return obj;
    default:
      return state;
  }
}

export default fileReducer;