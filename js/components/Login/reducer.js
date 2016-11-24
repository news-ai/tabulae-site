import {
  loginConstant,
  SET_FIRST_TIME_USER,
  REMOVE_FIRST_TIME_USER
} from './constants';
import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from 'utils/assign';
import _ from 'lodash';

function personReducer(state = initialState.personReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case loginConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case loginConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.person = action.person;
      return obj;
    case loginConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case SET_FIRST_TIME_USER:
      obj = assignToEmpty(state, {});
      obj.firstTimeUser = true;
      return obj;
    case REMOVE_FIRST_TIME_USER:
      obj = assignToEmpty(state, {});
      obj.firstTimeUser = false;
      return obj;
    default:
      return state;
  }
}

export default personReducer;
