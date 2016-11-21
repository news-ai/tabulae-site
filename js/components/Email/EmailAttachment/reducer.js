import {initialState} from '../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../utils/assign';

const types = [
  'SET_ATTACHMENTS',
  'REMOVE_ATTACHMENT',
  'CLEAR_ATTACHMENTS'
];

function emailAttachmentReducer(state = initialState.emailAttachmentReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  switch (action.type) {
    case 'SET_ATTACHMENTS':
      obj.attached = action.files;
      return obj;
    case 'CLEAR_ATTACHMENTS':
      obj.attached = [];
      return obj;
    default:
      return state;
  }
}

export default emailAttachmentReducer;
