import 'isomorphic-fetch';

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

