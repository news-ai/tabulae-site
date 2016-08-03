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
  const base = 'http://tabulae.newsai.org/api/auth/google';
  window.location.href = base;
}

// FIX JANK CODE LATER
export function fetchPerson() {
  return dispatch => {
    dispatch(requestLogin());
    return fetch(`${window.TABULAE_API_BASE}/users/me`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        if (body) {
          const person = JSON.parse(body);
          return dispatch(receiveLogin(person));
        } else {
          return dispatch(loginFail());
        }
    }).then( _ => {
      dispatch({ type: 'REQUEST_PUBLICATIONS'});
      return fetch(`${window.TABULAE_API_BASE}/publications`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        const json = JSON.parse(body);
        return dispatch({ type: 'RECEIVE_PUBLICATIONS', json});
      });
    });
  };
}


