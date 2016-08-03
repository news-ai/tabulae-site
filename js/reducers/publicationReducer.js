import {
  REQUEST_PUBLICATION,
  RECEIVE_PUBLICATION,
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function publicationReducer(state = initialState.publicationReducer, action) {
  if (window.isDev) Object.freeze(state);
  // let accessing = false;
  // if (
  //   action.type === REQUEST_PUBLICATION ||
  //   action.type === RECEIVE_PUBLICATION
  //   ) accessing = true;
  // else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case REQUEST_PUBLICATION:
      obj.isReceiving = true;
      return obj;
    case RECEIVE_PUBLICATION:
      obj.isReceiving = false;
      obj[action.publication.id] = action.publication;
      return obj;
    case 'RECEIVE_PUBLICATIONS':
      action.json.map( pub => {
        obj[pub.id] = pub;
      });
      return obj;
    default:
      return state;
  }
}

export default publicationReducer;