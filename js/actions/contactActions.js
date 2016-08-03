import {
  REQUEST_CONTACT,
  RECEIVE_CONTACT,
  REQUEST_CONTACT_FAIL,
  ADDING_CONTACT,
} from '../constants/AppConstants';
import 'isomorphic-fetch';
// import * as listActions from './listActions';


function requestContact() {
  return {
    type: REQUEST_CONTACT
  };
}

function receiveContact(contact) {
  return (dispatch, getState) => {
    if (contact.employers !== null) {
      const publications = getState().publicationReducer;
      console.log(contact.id);
      const employerString = contact.employers
      .map( id => publications[id])
      .filter( pub => pub )
      .map( pub => pub.name );
      console.log(employerString);
      contact.employerString = employerString;
    }
    return dispatch({
      type: RECEIVE_CONTACT,
      contact
    });
  };
}

function requestContactFail() {
  return {
    type: REQUEST_CONTACT_FAIL
  };
}


export function fetchContact(contactId) {
  return dispatch => {
    dispatch(requestContact());
    return fetch(`${window.TABULAE_API_BASE}/contacts/${contactId}`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => body ? dispatch(receiveContact(JSON.parse(body))) : dispatch(requestContactFail()));
  };
}

export function fetchContacts(listId) {
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    return Promise.all(getState().listReducer[listId].contacts.map( contactId => dispatch(fetchContact(contactId))));
  };
}

export function updateContact(id) {
  return (dispatch, getState) => {
    return fetch(`${window.TABULAE_API_BASE}/contacts/${id}/update`, { credentials: 'include'})
    .then( response => response.status !== 200 ? false : response.text())
    .then( body => body ? dispatch(receiveContact(JSON.parse(body))) : dispatch(requestContactFail()));
  };
}

export function patchContacts(contactList) {
  return dispatch => {
    dispatch({ type: 'PATCH_CONTACTS' });
    return fetch(`${window.TABULAE_API_BASE}/contacts`, {
      method: 'PATCH',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(contactList)
    })
    .then( response => response.text())
    .then( text => {
      const json = JSON.parse(text);
      
      return json;
    });
  };
}

export function addContacts(contactList) {
  return dispatch => {
    dispatch({ type: ADDING_CONTACT });
    return fetch(`${window.TABULAE_API_BASE}/contacts`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(contactList)
    })
    .then( response => response.text())
    .then( text => {
      const json = JSON.parse(text);
      json.map( contact => dispatch({
        type: RECEIVE_CONTACT,
        contactId: contact.id,
        contact
      }));
      return json;
    });
  };
}


