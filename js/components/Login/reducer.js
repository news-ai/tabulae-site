import {
  loginConstant,
  SET_FIRST_TIME_USER
} from './constants';
import { initialState } from '../../reducers/initialState';
import { assignToEmpty, canAccessReducer } from '../../utils/assign';
import _ from 'lodash';


const types = _.values(loginConstant);
types.push(SET_FIRST_TIME_USER);

function personReducer(state = initialState.personReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case loginConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case loginConstant.RECEIVE:
      obj.isReceiving = false;
      obj.person = action.person;
      return obj;
    case loginConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case SET_FIRST_TIME_USER:
      obj.firstTimeUser = true;
      return obj;
    default:
      return state;
  }
}

export default personReducer;
