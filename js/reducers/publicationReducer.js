import { publicationConstant } from '../constants/AppConstants';
import { canAccessReducer } from './utils';
import _ from 'lodash';
import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

const types = _.values(publicationConstant);

function publicationReducer(state = initialState.publicationReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case publicationConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case publicationConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.publication.id] = action.publication;
      obj[action.publication.name] = action.publication.id;
      return obj;
    case publicationConstant.RECEIVE_MULTIPLE:
      obj.isReceiving = false;
      obj = assignToEmpty(state, action.publications);
      obj.received = state.received.concat(action.ids);
      return obj;
    default:
      return state;
  }
}

export default publicationReducer;
