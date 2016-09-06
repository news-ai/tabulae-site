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
    case (templateConstant.REQUEST || templateConstant.CREATE_REQUEST):
      obj.isReceiving = true;
      return obj;
    case (templateConstant.RECEIVE || templateConstant.CREATE_RECEIVED):
      obj.isReceiving = false;
      obj[action.template.id] = action.template;
      if (!state.received.some(id => id === action.template.id)) {
        const newReceived = [...state.received, action.template.id];
        obj.received = newReceived;
      }
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
