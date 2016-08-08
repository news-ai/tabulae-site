import fetch from 'isomorphic-fetch';
import * as api from './api';

import {
  LOGIN_FAIL,
  REQUEST_LOGIN,
  RECEIVE_LOGIN,
} from 'constants/AppConstants';


function requestLogin() {
  return {
    type: REQUEST_LOGIN
  };
}

function receiveLogin(person) {
  return {
    type: RECEIVE_LOGIN,
    person
  };
}

function loginFail() {
  return {
    type: LOGIN_FAIL
  };
}

export function loginWithGoogle() {
  const base = `http://tabulae.newsai.org/api/auth/google?next=${window.location}`;
  window.location.href = base;
}

export function login() {
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

// FIX JANK CODE LATER
export function fetchPerson() {
  return dispatch => {
    dispatch(requestLogin());

    return api.get('/users/me')
    .then( response => dispatch(receiveLogin(response))
      .then( _ => {
        dispatch({ type: 'REQUEST_PUBLICATIONS'});
        api.get('/publications')
        .then( json => dispatch({ type: 'RECEIVE_PUBLICATIONS', json }))
        .catch( message => console.log(message));
      }))
    .catch( message => dispatch(loginFail()));
  };
}


