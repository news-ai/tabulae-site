import {
  ADDING_CONTACT,
  ADDED_CONTACT
} from '../constants/AppConstants';

import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function contactReducer(state = initialState.contactReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === ADDING_CONTACT ||
    action.type === ADDED_CONTACT
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case ADDING_CONTACT:
      obj.isReceiving = true;
      return obj;
    case ADDED_CONTACT:
      obj.isReceiving = false;
      obj[action.contactId] = action.contact;
      return obj;
    default:
      return state;
  }
}

export default contactReducer;