import fetch from 'isomorphic-fetch';
import request from 'superagent';

export function get(endpoint) {
  return fetch(`${window.TABULAE_API_BASE}${endpoint}`, { credentials: 'include'})
    .then( response => response.status === 200 ? response.text() : Promise.reject(response))
    .then( text => JSON.parse(text));
}

export function post(endpoint, body) {
  return fetch(`${window.TABULAE_API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body)
  })
    .then( response => response.status === 200 ? response.text() : Promise.reject(response))
    .then( text => JSON.parse(text));
}

export function postFile(endpoint, file) {
  return fetch(`${window.TABULAE_API_BASE}${endpoint}`, {
    method: 'POST',
    // headers: {
    //   'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    //   'Content-Type': 'multipart/form-data; boundary=' + boundary,
    // },
    credentials: 'include',
    body: file
  })
    .then( response => response.status === 200 ? response.text() : Promise.reject(response.text()))
    .then( text => JSON.parse(text));
}

export function patch(endpoint, body) {
  return fetch(`${window.TABULAE_API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify(body)
  })
    .then( response => response.status === 200 ? response.text() : Promise.reject(response))
    .then( text => JSON.parse(text));
}

