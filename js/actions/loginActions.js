import * as api from './api';
import { loginConstant } from 'constants/AppConstants';


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

export function loginWithGoogle() {
  const base = `http://tabulae.newsai.org/api/auth/google?next=${window.location}`;
  window.location.href = base;
}

export function onLogin() {
  const base = `http://tabulae.newsai.org/api/auth?next=${window.location}`;
  window.location.href = base;
}

export function register() {
  const base = `http://tabulae.newsai.org/api/auth/registration?next=${window.location}`;
  window.location.href = base;
}

export function logout() {
  const base = `http://tabulae.newsai.org/api/auth/logout?next=${window.location}`;
  window.location.href = base;
}

export function fetchPerson() {
  return dispatch => {
    dispatch(requestLogin());
    return api.get('/users/me')
    .then( response => dispatch(receiveLogin(response)))
    .catch( message => dispatch(loginFail(message)));
  };
}


