import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  REQUEST_LISTS_FAIL,
} from '../constants/AppConstants';
// import 'isomorphic-fetch';
import * as contactActions from './contactActions';


function requestLists() {
  return {
    type: REQUEST_LISTS
  };
}

function requestList() {
  return {
    type: 'REQUEST_LIST'
  };
}

function receiveLists(lists) {
  return {
    type: RECEIVE_LISTS,
    lists
  };
}

function receiveList(listId, list) {
  return {
    type: 'RECEIVE_LIST',
    listId,
    list
  };
}

function requestListFail() {
  return {
    type: REQUEST_LISTS_FAIL
  };
}


export function fetchList(listId) {
  return dispatch => {
    dispatch(requestLists());
    return fetch(`${window.TABULAE_API_BASE}/lists/${listId}`, { credentials: 'include'})
    .then( response => response.status !== 200 ? false : response.text())
    .then( body => {
      return dispatch(receiveList(listId, JSON.parse(body)));
    });
  };
}


export function fetchLists() {
  return dispatch => {
    dispatch(requestLists());
    return fetch(`${window.TABULAE_API_BASE}/lists`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        if (body) {
          const lists = JSON.parse(body);
          return dispatch(receiveLists(lists));
        } else {
          return dispatch(requestListFail());
        }
    });
  };
}

export function addListWithoutContacts(name) {
  const listBody = {
    name: name.length === 0 ? 'untitled' : name
  };

  return dispatch => {
    return fetch(`${window.TABULAE_API_BASE}/lists`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(listBody)
    })
    .then( response => response.text())
    .then( text => {
      console.log(text);
      return dispatch(fetchLists());
    });
  };
}

// NOT WORKING YET
export function patchList(listId, name, contacts) {
  const listBody = {};
  if (name !== undefined) listBody.name = name;
  if (contacts !== undefined) listBody.contacts = contacts;
  console.log(listBody);
  console.log(JSON.stringify(listBody));

  return dispatch => {
    return fetch(`${window.TABULAE_API_BASE}/lists/${listId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(listBody)
    })
    .then( response => response.text())
    .then( text => {
      console.log(text);
      let json = JSON.parse(text);
      console.log(json);
      return dispatch(receiveList(listId, json));
    });
  };
}

export function createNewSheet(name, contactList) {
  return dispatch => dispatch(contactActions.addContacts(contactList))
  .then( json => {
    const contacts = json.map( contact => contact.id );
    const listBody = {
      name: name,
      contacts: contacts
    };
    return fetch(`${window.TABULAE_API_BASE}/lists`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(listBody)
    })
    .then( response => response.text())
    .then( text => {
      const json = JSON.parse(text);
      const listId = json.id;
      dispatch(receiveList(listId, json));
      window.location.href = window.location.origin + '/lists/' + listId;
    });

  });
}







