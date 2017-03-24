import {headerConstant} from './constants';
import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function headerReducer(state = initialState.headerReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case headerConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case headerConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj[action.listId] = action.headers;
      return obj;
    case headerConstant.REQUEST_FAIL:
      if (!window.isDev) window.Intercom('trackEvent', 'headers_upload_error', {error: action.error});
      return assignToEmpty(state, {
        didInvalidate: true,
        isReceiving: false
      });
    default:
      return state;
  }
}

export default headerReducer;
