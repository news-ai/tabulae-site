import {
  ADDING_CONTACT,
  contactConstant
} from '../constants/AppConstants';
import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';

function contactReducer(state = initialState.contactReducer, action) {
  if (window.isDev) Object.freeze(state);
  let accessing = false;
  if (
    action.type === ADDING_CONTACT ||
    action.type === contactConstant.REQUEST ||
    action.type === contactConstant.RECEIVE ||
    action.type === contactConstant.REQUEST_FAIL
    ) accessing = true;
  else return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case ADDING_CONTACT:
      obj.isReceiving = true;
      return obj;
    case contactConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case contactConstant.RECEIVE:
      obj.isReceiving = false;
      obj[action.contact.id] = action.contact;
      if (action.contact.customfields && action.contact.customfields !== null) {
        action.contact.customfields.map( field => {
          obj[action.contact.id][field.name] = field.value;
        });
      }
      return obj;
    case 'PATCH_CONTACTS':
      obj.isReceiving = true;
      return obj;
    default:
      return state;
  }
}

export default contactReducer;