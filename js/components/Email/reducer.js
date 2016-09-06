import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET
} from './constants';

import { initialState } from '../../reducers/initialState';
import { assignToEmpty, canAccessReducer } from '../../utils/assign';

const types = [
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET
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
    case RECEIVE_MULTIPLE_EMAILS:
      obj = assignToEmpty(state, action.emails);
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(seenId => seenId === id)));
      return obj;
    case EMAIL_SET_OFFSET:
      obj.offset = action.offset;
      return obj;
    default:
      return state;
  }
}

export default stagingReducer;
