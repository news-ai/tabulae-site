import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';
import {imgConstant} from './constants';

function emailImageReducer(state = initialState.emailImageReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case imgConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case imgConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj[action.src] = {size: 1};
      return obj;
    case imgConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case 'SET_IMAGE_SIZE':
      obj = assignToEmpty(state, {});
      obj[action.src] = Object.assign({}, state[action.src], {size: action.size});
      obj.updated = true;
      obj.current = action.src;
      return obj;
    case 'ON_IMAGE_UPDATED':
      obj = assignToEmpty(state, {});
      obj.updated = false;
      obj.current = null;
      return obj;
    case 'SAVE_IMAGE_ENTITY_KEY':
      obj = assignToEmpty(state, {});
      obj[action.src] = Object.assign({}, state[action.src], {entityKey: action.entityKey});
      return obj;
    case 'SET_IMAGE_LINK':
      obj = assignToEmpty(state, {});
      obj[action.src] = Object.assign({}, state[action.src], {imageLink: action.imageLink});
      obj.updated = true;
      obj.current = action.src;
      return obj;
    case 'UNSET_IMAGE_LINK':
      obj = assignToEmpty(state, {});
      obj[action.src] = Object.assign({}, state[action.src], {imageLink: undefined});
      obj.updated = true;
      obj.current = action.src;
      return obj;
    default:
      return state;
  }
}

export default emailImageReducer;