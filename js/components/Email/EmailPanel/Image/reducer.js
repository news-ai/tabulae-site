import {initialState} from 'reducers/initialState';
import {assignToEmpty, canAccessReducer} from 'utils/assign';
import {imgConstant} from './constants';
import values from 'lodash/values';

const types = [
  ...values(imgConstant),
  'SET_IMAGE_SIZE',
  'SAVE_IMAGE_ENTITY_KEY',
  'ON_IMAGE_UPDATED',
  'SET_IMAGE_LINK',
  'UNSET_IMAGE_LINK'
];

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
      obj[action.src] = {size: 1};
      return obj;
    case imgConstant.REQUEST_FAIL:
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case 'SET_IMAGE_SIZE':
      obj[action.src] = Object.assign({}, state[action.src], {size: action.size});
      obj.updated = true;
      obj.current = action.src;
      return obj;
    case 'ON_IMAGE_UPDATED':
      obj.updated = false;
      obj.current = null;
      return obj;
    case 'SAVE_IMAGE_ENTITY_KEY':
      obj[action.src] = Object.assign({}, state[action.src], {entityKey: action.entityKey});
      return obj;
    case 'SET_IMAGE_LINK':
      obj[action.src] = Object.assign({}, state[action.src], {imageLink: action.imageLink});
      obj.updated = true;
      obj.current = action.src;
      return obj;
    case 'UNSET_IMAGE_LINK':
      obj[action.src] = Object.assign({}, state[action.src], {imageLink: undefined});
      obj.updated = true;
      obj.current = action.src;
      return obj;
    default:
      return state;
  }
}

export default emailImageReducer;
