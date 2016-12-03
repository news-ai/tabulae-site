import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET,
  SET_SCHEDULE_TIME,
  CLEAR_SCHEDULE_TIME,
} from './constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function stagingReducer(state = initialState.stagingReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case SENDING_STAGED_EMAILS:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case RECEIVE_STAGED_EMAILS:
      obj = assignToEmpty(state, action.emails);
      obj.previewEmails = action.previewEmails;
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(seenId => seenId === id)));
      obj.isReceiving = false;
      return obj;
    case RECEIVE_EMAIL:
      obj = assignToEmpty(state, action.email);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      return obj;
    case REQUEST_MULTIPLE_EMAILS:
      obj = assignToEmpty(state, action.emails);
      obj.isReceiving = true;
      return obj;
    case RECEIVE_MULTIPLE_EMAILS:
      obj = assignToEmpty(state, action.emails);
      if (action.contactId) {
        obj.contactOffset = assignToEmpty(state.contactOffset, {});
        obj.contactOffset[action.contactId] = action.offset;
      }
      const unseen = action.ids.filter(id => !state[id]);
      const unsorted = state.received.concat(unseen);
      unsorted.sort( function(aId, bId) {
        const aDate = new Date(obj[aId].sendat);
        const bDate = new Date(obj[bId].sendat);
        if (aDate > bDate) return -1;
        if (aDate < bDate) return 1;
        return 0;
      });
      obj.received = unsorted;
      obj.isReceiving = false;
      return obj;
    case EMAIL_SET_OFFSET:
      obj = assignToEmpty(state, {});
      obj.offset = action.offset;
      return obj;
    case SET_SCHEDULE_TIME:
      obj = assignToEmpty(state, {});
      obj.utctime = action.utctime;
      return obj;
    case CLEAR_SCHEDULE_TIME:
      obj = assignToEmpty(state, {});
      obj.utctime = null;
      return obj;
    default:
      return state;
  }
}

export default stagingReducer;
