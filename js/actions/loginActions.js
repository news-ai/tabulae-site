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
  const path = window.location.pathname.split('/').filter( word => word.length > 0);
  const base = 'https://context.newsai.org/login/google-oauth2';
  window.location.href = (path[0] === 'entities' || path[0] === 'articles') ? `${base}?next=/publisher${window.location.pathname}` : base;
}

export function fetchPerson() {
  return dispatch => {
    dispatch(requestLogin());
    return fetch(`${window.CONTEXT_API_BASE}/users/me`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        if (body) {
          const person = JSON.parse(body);
          mixpanel.identify(String(person.id));
          return dispatch(receiveLogin(person));
        } else {
          return dispatch(loginFail());
        }
    });
  };
}


