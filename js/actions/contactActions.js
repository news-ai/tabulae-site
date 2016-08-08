import {
  REQUEST_CONTACT,
  RECEIVE_CONTACT,
  REQUEST_CONTACT_FAIL,
  ADDING_CONTACT,
} from '../constants/AppConstants';
import 'isomorphic-fetch';
import * as api from './api';
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
      const employerString = contact.employers
      .map( id => publications[id])
      .filter( pub => pub )
      .map( pub => pub.name );
      console.log(employerString);
      console.log('JANK CODE FIX EMPLOYERS AFTER SLP DEMO');
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
    return api.get('/contacts/' + contactId)
    .then( response => dispatch(receiveContact(response)))
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function fetchContacts(listId) {
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    return Promise.all(
      getState().listReducer[listId].contacts.map( contactId => dispatch(fetchContact(contactId)))
      );
  };
}

export function updateContact(id) {
  return (dispatch, getState) => {
    return api.get('/contacts/' + id + '/update')
    .then( response => dispatch(receiveContact(response)))
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function patchContacts(contactList) {
  return dispatch => {
    dispatch({ type: 'PATCH_CONTACTS' });

    return api.patch('/contacts', contactList)
    .then( response => response)
    .catch( message => console.log(message));
  };
}

export function addContacts(contactList) {
  return dispatch => {
    dispatch({ type: ADDING_CONTACT });

    return api.post('/contacts', contactList)
    .then( response => {
      response.map( contact => dispatch({
        type: RECEIVE_CONTACT,
        contactId: contact.id,
        contact
      }));
      return response;
    })
    .catch( message => console.log(message));
  };
}


