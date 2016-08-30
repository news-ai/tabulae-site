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
    case templateConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.template.id] = action.template;
      return obj;
    case templateConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default templateReducer;
