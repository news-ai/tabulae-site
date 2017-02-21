import {
  loginConstant,
  SET_FIRST_TIME_USER,
  REMOVE_FIRST_TIME_USER
} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function personReducer(state=initialState.personReducer, action) {
  if (window.isDev) Object.freeze(state);
  switch (action.type) {
    case loginConstant.REQUEST:
      return assignToEmpty(state, {isReceiving: true});
    case loginConstant.RECEIVE:
      return assignToEmpty(state, {
        isReceiving: false,
        person: action.person
      });
    case loginConstant.REQUEST_FAIL:
      return assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true
      });
    case SET_FIRST_TIME_USER:
      return assignToEmpty(state, {firstTimeUser: true});
    case REMOVE_FIRST_TIME_USER:
      return assignToEmpty(state, {firstTimeUser: false});
    case 'POSTING_FEEDBACK':
      return assignToEmpty(state, {
        feedbackIsReceiving: true
      });
    case 'POSTED_FEEDBACK':
      return assignToEmpty(state, {
        feedback: true,
        feedbackIsReceiving: false
      });
    case 'POSTED_FEEDBACK_FAIL':
      return assignToEmpty(state, {
        feedback: false,
        feedbackIsReceiving: false,
        feedbackDidInvalidate: true
      });
    case 'RECEIVE_USER':
      return assignToEmpty(state, {[action.user.id]: action.user});
    case 'RECEIVE_EMAIL_MAX_ALLOWANCE':
      return assignToEmpty(state, {allowance: action.allowance, ontrial: action.ontrial});
    default:
      return state;
  }
}

export default personReducer;
