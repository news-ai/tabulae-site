import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function notificationReducer(state = initialState.notificationReducer, action) {
  if (window.isDev) Object.freeze(state);
  switch (action.type) {
    case 'RECEIVE_NOTIFICATION':
      return assignToEmpty(state, {
        messages: [...state.messages, action.message]
      });
    default:
      return state;
  }
}

export default notificationReducer;
