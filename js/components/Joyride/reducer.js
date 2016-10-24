import {
  TURN_ON_UPLOAD_GUIDE,
  TURN_OFF_UPLOAD_GUIDE,
  TURN_ON_GENERAL_GUIDE,
  TURN_OFF_GENERAL_GUIDE,
  FORWARD_STEP,
  BACKWARD_STEP,
} from './constants';
import {REMOVE_FIRST_TIME_USER} from '../Login/constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../utils/assign';

const types = [
  TURN_ON_UPLOAD_GUIDE,
  TURN_OFF_UPLOAD_GUIDE,
  TURN_ON_GENERAL_GUIDE,
  TURN_OFF_GENERAL_GUIDE,
  FORWARD_STEP,
  BACKWARD_STEP,
  REMOVE_FIRST_TIME_USER
];

function joyrideReducer(state = initialState.joyrideReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case REMOVE_FIRST_TIME_USER:
      obj.showUploadGuide = false;
      obj.showGeneralGuide = false;
      return obj;
    case TURN_ON_UPLOAD_GUIDE:
      obj.showUploadGuide = true;
      return obj;
    case TURN_OFF_UPLOAD_GUIDE:
      obj.showUploadGuide = false;
      return obj;
    case TURN_ON_GENERAL_GUIDE:
      obj.showGeneralGuide = true;
      return obj;
    case TURN_OFF_GENERAL_GUIDE:
      obj.showGeneralGuide = false;
      return obj;
    case FORWARD_STEP:
      return obj;
    case BACKWARD_STEP:
      return obj;
    default:
      return state;
  }
}

export default joyrideReducer;
