import fetch from 'isomorphic-fetch';

import {
  LOGIN_FAIL,
  REQUEST_LOGIN,
  RECEIVE_LOGIN,
} from '../constants/AppConstants';


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
  const base = 'http://tabulae.newsai.org';
  window.location.href = base;
}

export function fetchPerson() {
  return dispatch => {
    dispatch(requestLogin());
    const url = `${window.TABULAE_API_BASE}/users/me`;
    console.log(url);
    return fetch(`${window.TABULAE_API_BASE}/users/me`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        if (body) {
          const person = JSON.parse(body);
          return dispatch(receiveLogin(person));
        } else {
          return dispatch(loginFail());
        }
    });
  };
}


