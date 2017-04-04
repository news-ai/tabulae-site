import {emailStatsConstant} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailStatsReducer(state = initialState.emailStatsReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case emailStatsConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case emailStatsConstant.CREATE_REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case emailStatsConstant.RECEIVE:
      obj = assignToEmpty(state, action.emailStats);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case emailStatsConstant.CREATE_RECEIVED:
      obj = assignToEmpty(state, action.emailStats);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case emailStatsConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case emailStatsConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.emailStatss);
      const newReceived = state.received.concat(action.ids.filter(id => !state[id]));
      obj.received = newReceived;
      obj.offset = action.offset;
      return obj;
    case emailStatsConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default emailStatsReducer;

