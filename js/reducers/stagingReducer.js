import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function stagingReducer(state = initialState.stagingReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === RECEIVE_STAGED_EMAILS ||
    action.type === SENDING_STAGED_EMAILS ||
    action.type === RECEIVE_EMAIL
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case SENDING_STAGED_EMAILS:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_STAGED_EMAILS:
      obj.isReceiving = false;
      obj.previewEmails = action.json;
      action.json.map( email => obj[email.id] = email);
      return obj;
    case RECEIVE_EMAIL:
      obj[action.json.id] = action.json;
      return obj;
    default:
      return state;
  }
}

export default stagingReducer;