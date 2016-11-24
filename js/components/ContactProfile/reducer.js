import {feedConstant} from './constants';
import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function feedReducer(state = initialState.feedReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case feedConstant.ADD_REQUESTED:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case feedConstant.ADD_RECEIVED:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      return obj;
    case feedConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case feedConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.feeds);
      obj[action.contactId] = action.ids;
      obj.isReceiving = false;
      obj.received = [...state.received, ...action.ids.filter(id => !state[id])];
      return obj;
    default:
      return state;
  }
}

export default feedReducer;
