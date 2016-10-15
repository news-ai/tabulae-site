import {
  ADDING_CONTACT,
  contactConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL
} from '../constants/AppConstants';
import { assignToEmpty } from '../utils/assign';
import { initialState } from './initialState';
import { canAccessReducer } from './utils';
import _ from 'lodash';

const types = _.values(contactConstant);
types.push(
  ADDING_CONTACT,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL,
  );

function contactReducer(state = initialState.contactReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case contactConstant.MANUALLY_SET_ISRECEIVING_ON:
      obj.isReceiving = true;
      return obj;
    case contactConstant.MANUALLY_SET_ISRECEIVING_OFF:
      obj.isReceiving = false;
      return obj;
    case ADDING_CONTACT:
      obj.isReceiving = true;
      return obj;
    case contactConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case contactConstant.RECEIVE:
      obj.isReceiving = false;
      if (!state[action.contact.id]) obj.received = [...state.received, action.contact.id];
      obj[action.contact.id] = action.contact;
      if (action.contact.customfields && action.contact.customfields !== null) {
        action.contact.customfields.map( field => {
          obj[action.contact.id][field.name] = field.value;
        });
      }
      return obj;
    case contactConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.contacts);
      obj.received = state.received.concat(action.ids.filter(id => !state[id]));
      obj.isReceiving = false;
      action.ids.map(id => {
        if (obj[id].customfields && obj[id].customfields !== null) {
          obj[id].customfields.map( field => {
            obj[id][field.name] = field.value;
          });
        }
      });
      return obj;
    case 'PATCH_CONTACTS':
      obj.isReceiving = true;
      return obj;
    default:
      return state;
  }
}

export default contactReducer;