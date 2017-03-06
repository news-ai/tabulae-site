import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET,
  SET_SCHEDULE_TIME,
  CLEAR_SCHEDULE_TIME,
  FETCH_EMAIL_LOGS,
  FETCH_EMAIL_LOGS_FAIL,
  RECEIVE_EMAIL_LOGS,
} from './constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function stagingReducer(state = initialState.stagingReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  let unsorted, unseen;
  switch (action.type) {
    case SENDING_STAGED_EMAILS:
      return Object.assign({}, state, {isReceiving: true});
    case RECEIVE_STAGED_EMAILS:
      obj = assignToEmpty(state, action.emails);
      obj.previewEmails = action.previewEmails;
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(seenId => seenId === id)));
      obj.isReceiving = false;
      return obj;
    case RECEIVE_EMAIL:
      obj = assignToEmpty(state, action.email);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case REQUEST_MULTIPLE_EMAILS:
      return Object.assign({}, state, {isReceiving: true});
    case RECEIVE_MULTIPLE_EMAILS:
      obj = assignToEmpty(state, action.emails);
      if (action.contactId) {
        obj.contactOffsets = assignToEmpty(state.contactOffsets, {});
        obj.contactOffsets[action.contactId] = action.offset;
      }
      if (action.listId) {
        obj.listOffsets = assignToEmpty(state.listOffsets, {
          [action.listId]: action.offset
        });
      }
      unseen = action.ids.filter(id => !state[id]);
      unsorted = state.received.concat(unseen);
      unsorted.sort(function(aId, bId) {
        const aDate = new Date(obj[aId].created);
        const bDate = new Date(obj[bId].created);
        if (aDate > bDate) return -1;
        if (aDate < bDate) return 1;
        return 0;
      });
      obj.received = unsorted;
      obj.isReceiving = false;
      return obj;
    case 'RECEIVE_MULTIPLE_EMAILS_MANUAL':
      obj = assignToEmpty(state, action.emails);
      if (action.contactId) {
        obj.contactOffsets = assignToEmpty(state.contactOffsets, {});
        obj.contactOffsets[action.contactId] = action.offset;
      }
      if (action.listId) {
        obj.listOffsets = assignToEmpty(state.listOffsets, {});
        obj.listOffsets[action.listId] = action.offset;
      }
      unseen = action.ids.filter(id => !state[id]);
      unsorted = state.received.concat(unseen);
      unsorted.sort(function(aId, bId) {
        const aDate = new Date(obj[aId].created);
        const bDate = new Date(obj[bId].created);
        if (aDate > bDate) return -1;
        if (aDate < bDate) return 1;
        return 0;
      });
      obj.received = unsorted;
      return obj;
    case EMAIL_SET_OFFSET:
      obj = assignToEmpty(state, {});
      if (action.scheduledOffset) obj.scheduledOffset = action.scheduledOffset;
      if (action.offset) obj.offset = action.offset;
      return obj;
    case SET_SCHEDULE_TIME:
      return assignToEmpty(state, {utctime: action.utctime});
    case CLEAR_SCHEDULE_TIME:
      return assignToEmpty(state, {utctime: null});
    case FETCH_EMAIL_LOGS:
      return Object.assign({}, state, {isReceiving: true});
    case RECEIVE_EMAIL_LOGS:
      return Object.assign({}, state, {
        [action.emailId]: Object.assign({}, state[action.emailId], {
          logs: action.logs,
          links: action.links,
        }),
        isReceiving: false
      });
    case 'SEND_EMAIL':
      return Object.assign({}, state, {isReceiving: true});
    case 'PATCH_EMAIL':
      return Object.assign({}, state, {isReceiving: true});
    case 'STAGING_MANUALLY_SET_ISRECEIVING_ON':
      return Object.assign({}, state, {isReceiving: true});
    case 'STAGING_MANUALLY_SET_ISRECEIVING_OFF':
      return Object.assign({}, state, {isReceiving: false});
    case 'RESET_STAGING_CONTACT_OFFSET':
      obj = assignToEmpty(state, {});
      obj.contactOffsets = assignToEmpty(state.contactOffsets, {});
      obj.contactOffsets[action.contactId] = 0;
      return obj;
    case 'RESET_STAGING_OFFSET':
      obj = assignToEmpty(state, {offset: 0});
      return obj;
    case 'RECEIVE_SEARCH_SENT_EMAILS':
      return assignToEmpty(state, {
        searchReceivedEmails: action.emails,
        searchQuery: action.query
      });
    default:
      return state;
  }
}

export default stagingReducer;
