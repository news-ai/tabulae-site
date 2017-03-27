import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailPreviewDraftReducer(state = initialState.emailPreviewDraftReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case 'INITIALIZE_PREVIEW_EMAIL_DRAFT':
      obj = assignToEmpty(state, {
        [action.emailId]: {
          contentState: action.contentState,
          bodyHtml: null
        }
      });
      return obj;
    default:
      return state;
  }
}

export default emailPreviewDraftReducer;
