import {
  ADDING_CONTACT,
  contactConstant
} from '../constants/AppConstants';
import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';
import { canAccessReducer } from './utils';
import _ from 'lodash';

const types = _.values(contactConstant);
types.push(
  ADDING_CONTACT
  );

function contactReducer(state = initialState.contactReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

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