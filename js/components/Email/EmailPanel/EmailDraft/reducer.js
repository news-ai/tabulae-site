import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailDraftReducer(state = initialState.emailDraftReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case 'INITIALIZE_EMAIL_DRAFT':
      obj = assignToEmpty(state, {});
      obj[action.listId] = {};
      return obj;
    case 'UPDATE_CC':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {cc: action.cc});
      return obj;
    case 'UPDATE_BCC':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {bcc: action.bcc});
      return obj;
    default:
      return state;
  }
}

export default emailDraftReducer;
