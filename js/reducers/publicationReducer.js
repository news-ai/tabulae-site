import {
  publicationConstant
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function publicationReducer(state = initialState.publicationReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === publicationConstant.REQUEST ||
    action.type === publicationConstant.RECEIVE
    ) accessing = true;
  else return state;

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
    default:
      return state;
  }
}

export default publicationReducer;