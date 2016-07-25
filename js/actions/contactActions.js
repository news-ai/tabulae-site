import {
  REQUEST_CONTACT,
  RECEIVE_CONTACT,
  REQUEST_CONTACT_FAIL,
  ADDING_CONTACT,
  ADDED_CONTACT
} from '../constants/AppConstants';
import 'isomorphic-fetch';
// import * as listActions from './listActions';


function requestContact() {
  return {
    type: REQUEST_CONTACT
  };
}

function receiveContact(contact) {
  return {
    type: RECEIVE_CONTACT,
    contact
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

// export function addContact(listId, body) {
//   return dispatch => {
//     dispatch({ type: ADDING_CONTACT });
//     return fetch(`${window.TABULAE_API_BASE}/contacts`, {
//       method: 'POST',
//       credentials: 'include',
//       body: JSON.stringify(body)
//     })
//     .then( response => response.text())
//     .then( text => {
//       const json = JSON.parse(text);
//       const contactId = json[0].id;
//       // TODO: collect contact object and contactId in list
//       return dispatch({
//         type: ADDED_CONTACT,
//         listId,
//         contactId
//       });
//     });
//   };
// }


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
      json.map( contact => dispatch({ type: ADDED_CONTACT, contactId: contact.id }));
      return json;
    });
    // .then( _ => dispatch(listActions.patchList(
    //   listId,
    //   getState().listReducer[listId].name,
    //   getState().listReducer[listId].temp
    //   )));
  };
}


