import {initialState} from 'reducers/initialState';
import {assignToEmpty, canAccessReducer} from 'utils/assign';
import {imgConstant} from './constants';
import values from 'lodash/values';

const types = [...values(imgConstant), 'SET_IMAGE_SIZE'];

function emailImageReducer(state = initialState.emailImageReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case imgConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case imgConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.src] = {
        size: '100%'
      };
      return obj;
    case imgConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case 'SET_IMAGE_SIZE':
      obj[action.src] = Object.assign({}, state[action.src], {size: action.size});
      return obj;
    default:
      return state;
  }
}

export default emailImageReducer;
