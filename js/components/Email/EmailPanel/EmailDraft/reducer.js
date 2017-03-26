import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailDraftReducer(state = initialState.emailDraftReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case 'INITIALIZE_EMAIL_DRAFT':
      obj = assignToEmpty(state, {
        isAttachmentPanelOpen: false,
        editorState: null
      });
      obj[action.listId] = {from: action.email};
      return obj;
    case 'TURN_ON_ATTACHMENT_PANEL':
      return assignToEmpty(state, {isAttachmentPanelOpen: true});
    case 'TURN_OFF_ATTACHMENT_PANEL':
      return assignToEmpty(state, {isAttachmentPanelOpen: false});
    case 'UPDATE_CC':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {cc: action.cc});
      return obj;
    case 'UPDATE_BCC':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {bcc: action.bcc});
      return obj;
    case 'SET_FROM_EMAIL':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {from: action.from});
      return obj;
    case 'SET_EDITORSTATE':
      return assignToEmpty(state, {editorState: action.editorState});
    case 'TEMPLATE_CHANGE_ON':
      return assignToEmpty(state, {templateChanged: true});
    case 'TEMPLATE_CHANGE_OFF':
      return assignToEmpty(state, {templateChanged: false});
    default:
      return state;
  }
}

export default emailDraftReducer;
