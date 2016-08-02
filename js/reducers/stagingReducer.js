import {
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function stagingReducer(state = initialState.stagingReducer, action) {
  if (window.isDev) Object.freeze(state);
  // let accessing = false;
  // if (
  //   ) accessing = true;
  // else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    // case REQUEST_LOGIN:
    //   obj.isReceiving = true;
    //   return obj;
    default:
      return state;
  }
}

export default stagingReducer;