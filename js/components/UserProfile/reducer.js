import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function smtpReducer(state = initialState.smtpReducer, action) {
  if (window.isDev) Object.freeze(state);
  let obj;
  switch (action.type) {
    case 'VERTIFY_SMTP_EMAIL':
      obj = assignToEmpty(state, {
        isReceiving: true
      });
      return obj;
    case 'VERTIFY_SMTP_EMAIL_RECEIVE':
      obj = assignToEmpty(state, {
        isReceiving: false,
        verification: action.verification
      });
      return obj;
    default:
      return state;
  }
}

export default smtpReducer;
