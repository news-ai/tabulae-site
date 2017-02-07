import * as api from 'actions/api';
import {
  loginConstant,
  SET_FIRST_TIME_USER,
  REMOVE_FIRST_TIME_USER
} from './constants';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
alertify.set('notifier', 'position', 'top-right');


function requestLogin() {
  return {
    type: loginConstant.REQUEST
  };
}

function receiveLogin(person) {
  return {
    type: loginConstant.RECEIVE,
    person
  };
}

function loginFail(message) {
  return {
    type: loginConstant.REQUEST_FAIL,
    message
  };
}

function notification(dispatch, args) {
  var notifications = JSON.parse(args.data);
  for (var i = notifications.length - 1; i >= 0; i--) {
    dispatch({type: 'EYY MESSAGE', message: notifications[i].message});
    alertify.notify(notifications[i].message, 'custom', 5, function() {});
  }
}

function log(argument) {
  console.log(argument);
}

export function addExtraEmail(email) {
  return dispatch => {
    dispatch({type: 'ADD_EXTRA_EMAIL', email});
    return api.post(`/users/me/add-email`, {email})
    .then(response => {
      alertify.notify(`Confirmation email has been sent to ${email}`, 'custom', 5, function() {});
      dispatch({type: 'ADD_EXTRA_EMAIL_CONFIRMATION_SENT'});
      return dispatch(receiveLogin(response.data));
    })
    .catch(err => console.log(err));
  };
}

export function postFeedback(reason, feedback) {
  return (dispatch) => {
    dispatch({type: 'POSTING_FEEDBACK', reason, feedback});
    return api.post(`/users/me/feedback`, {reason, feedback})
    .then(response => {
      return dispatch({type: 'POSTED_FEEDBACK'});
    })
    .catch(err => dispatch({type: 'POSTED_FEEDBACK_FAIL'}));
  };
}

export function fetchNotifications() {
  return dispatch => {
    return api.get('/users/me/token')
    .then(response => {
      const channel = new goog.appengine.Channel(response.token);
      const socket = channel.open();
      socket.onopen = log;
      socket.onmessage = args => notification(dispatch, args);
      socket.onerror = log;
      socket.onclose = log;
    });
  };
}


export function setFirstTimeUser() {
  return dispatch => dispatch({type: SET_FIRST_TIME_USER});
}

export function removeFirstTimeUser() {
  return dispatch => dispatch({type: REMOVE_FIRST_TIME_USER});
}

export function loginWithGoogle() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth/google?next=${window.location}`;
    dispatch({type: 'LOGIN WITH GOOGLE'});
    window.location.href = base;
  };
}

export function onLogin() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth?next=${window.location}`;
    dispatch({type: 'LOGIN'});
    window.location.href = base;
  };
}

export function register() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth/registration?next=${window.location}`;
    dispatch({type: 'REGISTER'});
    window.location.href = base;
  };
}

export function logout() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth/logout?next=${window.location}`;
    dispatch({type: 'LOGOUT'});
    window.location.href = base;
  };
}

export function fetchPerson() {
  return (dispatch, getState) => {
    if (getState().personReducer.person) return;
    dispatch(requestLogin());
    return api.get('/users/me')
    .then(response => dispatch(receiveLogin(response.data)))
    .catch(message => {
      if (window.isDev) console.log(message);
    });
  };
}

export function patchPerson(personBody) {
  return dispatch => {
    dispatch({type: 'PATCH_PERSON', personBody});
    return api.patch(`/users/me`, personBody)
    .then( response => dispatch(receiveLogin(response.data)))
    .catch( message => {
      if (window.isDev) console.log(message);
    });
  };
}
