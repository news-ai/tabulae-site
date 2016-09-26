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
      obj[action.id] = {};
      obj[action.id].isReceiving = true;
      return obj;
    case publicationConstant.RECEIVE:
      if (!state.received.some(id => id === action.publication.id)) obj.received = [...state.received, action.publication.id];
      obj[action.publication.id] = action.publication;
      obj[action.publication.name] = action.publication.id;
      obj.isReceiving = false;
      obj[action.publication.id].isReceiving = false;
      return obj;
    case publicationConstant.RECEIVE_MULTIPLE:
      const received = state.received.concat(action.ids.filter(id => !state[id]));
      obj = assignToEmpty(state, action.publications);
      action.ids.map(id => {
        obj[action.publications[id].name] = id;
      });
      obj.received = received;
      obj.isReceiving = false;
      return obj;
    default:
      return state;
  }
}

export default publicationReducer;
