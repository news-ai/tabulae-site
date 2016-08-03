import fetch from 'isomorphic-fetch';
import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL
} from '../constants/AppConstants';

export function postBatchEmails(emails) {
  console.log(JSON.stringify(emails));
  return (dispatch) => {
    dispatch({ type: SENDING_STAGED_EMAILS });
    return fetch(`${window.TABULAE_API_BASE}/emails`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(emails)
    })
    .then( response => response.status !== 200 ? false : response.text())
    .then( text => {
      const json = JSON.parse(text);
      dispatch({ type: RECEIVE_STAGED_EMAILS, json });
    });

  }
}

export function sendEmail(id) {
  return (dispatch) => {
    dispatch({ type: 'SEND_EMAIL', id });
    return fetch(`${window.TABULAE_API_BASE}/emails/${id}/send`, { credentials: 'include'})
    .then( response => response.status !== 200 ? false : response.text())
    .then( text => {
      const json = JSON.parse(text);
      dispatch({ type: RECEIVE_EMAIL, json });
      // console.log(json);
    })
  }
}

export function getStagedEmails() {
  return (dispatch) => {
    return fetch(`${window.TABULAE_API_BASE}/emails`, { credentials: 'include'})
    .then( response => response.status !== 200 ? false : response.text())
    .then( text => {
      const json = JSON.parse(text);
      dispatch({ type: RECEIVE_STAGED_EMAILS, json });
    })
  }

}