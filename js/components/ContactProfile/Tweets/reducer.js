import {tweetConstant} from './constants';
import {initialState} from '../../../reducers/initialState';
import {assignToEmpty} from '../../../utils/assign';

function tweetReducer(state = initialState.tweetReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case tweetConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case tweetConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(obj, action.tweets);
      const oldContact = state[action.contactId] || {received: []};
      obj[action.contactId] = assignToEmpty(state[action.contactId], {
        received: [
          ...oldContact.received,
          ...action.ids.filter(id => !oldContact[id])
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case tweetConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default tweetReducer;
