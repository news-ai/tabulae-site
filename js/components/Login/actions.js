import * as api from '../../actions/api';
import {
  loginConstant,
  SET_FIRST_TIME_USER
} from './constants';

function notification(argument) {
  var notifications = JSON.parse(argument.data);
  for (var i = notifications.length - 1; i >= 0; i--) {
      console.log(notifications[i].message);
  }
}

function log(argument) {
  console.log(argument);
}

export function fetchNotifications() {
  return dispatch => {
    return api.get('/users/me/token')
    .then(response => {
      const channel = new goog.appengine.Channel(response.token);
      const socket = channel.open();
      socket.onopen = log;
      socket.onmessage = notification;
      socket.onerror = log;
      socket.onclose = log;
    });
  };
}

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

export function setFirstTimeUser() {
  return dispatch => dispatch({type: SET_FIRST_TIME_USER});
}

export function loginWithGoogle() {
  const base = `${window.TABULAE_API_BASE}/auth/google?next=${window.location}`;
  console.log(base);
  window.location.href = base;
}

export function onLogin() {
  const base = `${window.TABULAE_API_BASE}/auth?next=${window.location}`;
  window.location.href = base;
}

export function register() {
  const base = `${window.TABULAE_API_BASE}/auth/registration?next=${window.location}`;
  window.location.href = base;
}

export function logout() {
  const base = `${window.TABULAE_API_BASE}/auth/logout?next=${window.location}`;
  window.location.href = base;
}

export function fetchPerson() {
  return (dispatch, getState) => {
    if (getState().personReducer.person) return;
    dispatch(requestLogin());
    return api.get('/users/me')
    .then( response => dispatch(receiveLogin(response.data)))
    .catch( message => {
      if (window.isDev) console.log(message);
    });
    // .catch( message => dispatch(loginFail(message)));
  };
}
