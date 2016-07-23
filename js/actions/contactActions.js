import {
  REQUEST_CONTACTS,
  RECEIVE_CONTACTS,
  REQUEST_CONTACTS_FAIL
} from '../constants/AppConstants';
import 'isomorphic-fetch';


function requestContacts() {
  return {
    type: REQUEST_CONTACTS
  };
}

function receiveContacts(contacts) {
  return {
    type: RECEIVE_CONTACTS,
    contacts
  };
}

function requestContactsFail() {
  return {
    type: REQUEST_CONTACTS_FAIL
  };
}


export function fetchContacts() {
  return dispatch => {
    dispatch(requestContacts());
    return fetch(`${window.TABULAE_API_BASE}/contacts`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        if (body) {
          const contacts = JSON.parse(body);
          return dispatch(receiveContacts(contacts));
        } else {
          return dispatch(requestContactsFail());
        }
    });
  };
}
