import {
  REQUEST_CONTACTS,
  RECEIVE_CONTACTS,
  REQUEST_CONTACTS_FAIL,
  ADDING_CONTACT,
  ADDED_CONTACT
} from '../constants/AppConstants';
import 'isomorphic-fetch';
import * as listActions from './listActions';


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
    // return Promise.all([
    //   ...contactList.map( contact => dispatch(addContact(listId, contact)))
    //   ])
    dispatch({ type: ADDING_CONTACT });
    return fetch(`${window.TABULAE_API_BASE}/contacts`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(contactList)
    })
    .then( response => response.text())
    .then( text => {
      console.log(text);
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


