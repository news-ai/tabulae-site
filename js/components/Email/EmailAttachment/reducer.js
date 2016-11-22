import {initialState} from '../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../utils/assign';

const types = [
  'SET_ATTACHMENTS',
  'CLEAR_ATTACHMENTS',
  'ALL_EMAIL_ATTACHMENTS_START',
  'ALL_EMAIL_ATTACHMENTS_FINISHED'
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
    case 'ALL_EMAIL_ATTACHMENTS_START':
      obj.isReceiving = true;
      return obj;
    case 'ALL_EMAIL_ATTACHMENTS_FINISHED':
      obj.isReceiving = false;
      return obj;
    default:
      return state;
  }
}

export default emailAttachmentReducer;
