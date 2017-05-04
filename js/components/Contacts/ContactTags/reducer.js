import {
  TAG_CONTACTS_REQUEST,
  TAG_CONTACTS_RECEIVE,
  TAG_CONTACTS_REQUEST_FAIL
} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function contactTagReducer(state = initialState.contactTagReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case TAG_CONTACTS_REQUEST:
      obj = assignToEmpty(state, {isReceiving: true});
      if (!obj[action.tag]) {
        obj[action.tag] = {received: [], offset: 0};
      }
      return obj;
    case TAG_CONTACTS_RECEIVE:
      return assignToEmpty(state, {
        [action.tag]: assignToEmpty(state[action.tag], {
          offset: action.offset,
          received: [...state[action.tag].received, ...action.received]
        })
      });
    default:
      return state;
  }
}

export default contactTagReducer;