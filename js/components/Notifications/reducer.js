import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function notificationReducer(state = initialState.notificationReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  switch (action.type) {
    case 'RECEIVE_NOTIFICATION':
      return assignToEmpty(state, {
        messages: [Object.assign({}, action.message, {data: JSON.parse(action.message.data), unread: true}), ...state.messages]
      });
    case 'RECEIVE_NOTIFICATIONS':
      return assignToEmpty(state, {
        messages: [...action.messages.map(msg => Object.assign({}, msg, {data: JSON.parse(msg.data), unread: true})) , ...state.messages]
      });
    case 'READ_NOTIFICATIONS':
      return assignToEmpty(state, {
        messages: state.messages.map(message => assignToEmpty(message, {unread: false}))
      });
    case 'CLEAR_NOTIFICATIONS':
      return assignToEmpty(state, {
        messages: []
      });
    default:
      return state;
  }
}

export default notificationReducer;
