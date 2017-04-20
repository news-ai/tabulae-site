import {campaignStatsConstant} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function campaignStatsReducer(state = initialState.campaignStatsReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case campaignStatsConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case campaignStatsConstant.RECEIVE:
      obj = assignToEmpty(state, action.stats);
      const newReceived = [...action.ids.filter(id => !state[id]), ...state.received];
      obj.received = newReceived;
      obj.offset = action.offset;
      obj.isReceiving = false;
      return obj;
    case campaignStatsConstant.REQUEST_FAIL:
      return assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true
      });
    default:
      return state;
  }
}

export default campaignStatsReducer;
