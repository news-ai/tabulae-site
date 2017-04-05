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
    case emailStatsConstant.RECEIVE:
      obj = assignToEmpty(state, action.stats);
      const newReceived = [...action.ids.filter(id => !state[id]), ...state.received];
      obj.received = newReceived;
      obj.offset = action.offset;
      obj.isReceiving = false;
      return obj;
    case emailStatsConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default emailStatsReducer;

