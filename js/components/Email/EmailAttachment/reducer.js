import {initialState} from '../../../reducers/initialState';
import {assignToEmpty} from '../../../utils/assign';

function emailAttachmentReducer(state = initialState.emailAttachmentReducer, action) {
  if (window.isDev) Object.freeze(state);

  let obj;
  switch (action.type) {
    case 'SET_ATTACHMENTS':
      obj = assignToEmpty(state, {});
      obj.attached = action.files;
      return obj;
    case 'CLEAR_ATTACHMENTS':
      obj = assignToEmpty(state, {});
      obj.attached = [];
      return obj;
    case 'ALL_EMAIL_ATTACHMENTS_START':
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case 'ALL_EMAIL_ATTACHMENTS_FINISHED':
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      return obj;
    default:
      return state;
  }
}

export default emailAttachmentReducer;
