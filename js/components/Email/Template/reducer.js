import {
  templateConstant
} from './constants';

import {initialState} from '../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../utils/assign';
import _ from 'lodash';

const types = _.values(templateConstant);

function templateReducer(state = initialState.templateReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case templateConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case templateConstant.CREATE_REQUEST:
      obj.isReceiving = true;
      return obj;
    case templateConstant.RECEIVE:
      obj = assignToEmpty(state, action.template);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case templateConstant.CREATE_RECEIVED:
      obj = assignToEmpty(state, action.template);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case templateConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case templateConstant.RECEIVE_MULTIPLE:
      obj = Object.assign({}, state, action.templates);
      const newReceived = state.received.concat(action.ids.filter(id => !state[id]));
      obj.received = newReceived;
      return obj;
    case templateConstant.REQUEST_MULTIPLE_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default templateReducer;
