import {mixedConstant} from './constants';
import {initialState} from '../../../reducers/initialState';
import {assignToEmpty} from '../../../utils/assign';

function mixedReducer(state = initialState.mixedReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case mixedConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case mixedConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, {});
      const oldContact = state[action.contactId] || {received: []};
      obj[action.contactId] = assignToEmpty(state[action.contactId], {
        received: [
          ...oldContact.received,
          ...action.feed
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case mixedConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default mixedReducer;
