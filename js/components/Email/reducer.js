import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL
} from './constants';

import { initialState } from '../../reducers/initialState';
import { assignToEmpty, canAccessReducer } from '../../utils/assign';

const types = [
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL
];

function stagingReducer(state = initialState.stagingReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

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
