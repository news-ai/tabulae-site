import {
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT,
  fileConstant,
  headerConstant
} from './constants';


import { initialState } from '../../reducers/initialState';
import { assignToEmpty, canAccessReducer } from '../../utils/assign';
import _ from 'lodash';

const types = _.values(fileConstant).concat(_.values(headerConstant));
types.push(
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT
  );

function fileReducer(state = initialState.fileReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case fileConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case fileConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case fileConstant.RECEIVE:
      obj.isReceiving = false;
      // file belongs to list
      obj[action.listId] = action.file;
      return obj;
    case headerConstant.REQUEST:
      obj.isReceiving = true;
      obj[action.listId] = assignToEmpty(state[action.listId], {didInvalidate: false});
      return obj;
    case headerConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.listId].headers = action.headers;
      return obj;
    case headerConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj[action.listId] = assignToEmpty(state[action.listId], {didInvalidate: true});
      return obj;
    case TURN_ON_PROCESS_WAIT:
      obj.isProcessWaiting = true;
      return obj;
    case TURN_OFF_PROCESS_WAIT:
      obj.isProcessWaiting = false;
      return obj;
    default:
      return state;
  }
}

export default fileReducer;