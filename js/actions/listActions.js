import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  REQUEST_LISTS_FAIL,
  PATCH_LIST,
  RECEIVE_LIST,
  REQUEST_LIST,
  ARCHIVE_LIST
} from '../constants/AppConstants';
import * as contactActions from './contactActions';
import * as api from './api';


function requestLists() {
  return {
    type: REQUEST_LISTS
  };
}

function requestList() {
  return {
    type: REQUEST_LIST
  };
}

function receiveLists(lists) {
  return {
    type: RECEIVE_LISTS,
    lists
  };
}

function receiveList(list) {
  return {
    type: RECEIVE_LIST,
    list
  };
}

function requestListFail(message) {
  return {
    type: REQUEST_LISTS_FAIL,
    message
  };
}

function receiveFile(fileObj) {
  console.log(fileObj);
}

export function uploadFile(listId, file) {
  return dispatch => {
    dispatch({ type: 'UPLOAD_FILE', listId, file});
    return api.postFile('/lists/' + listId + '/upload', file)
    .then( response => dispatch(receiveFile(response)))
    .catch( message => dispatch({ type: 'UPLOAD_FILE_FAIL', message }));
  };
}


export function fetchList(listId) {
  return dispatch => {
    dispatch(requestLists());
    return api.get('/lists/' + listId)
    .then( response => dispatch(receiveList(response)))
    .catch( message => dispatch(requestListFail(message)));
  };
}


export function fetchLists() {
  return dispatch => {
    dispatch(requestLists());
    return api.get('/lists')
    .then( response => dispatch(receiveLists(response)))
    .catch( message => console.log(message));
  };
}

export function patchList(listId, name, contacts, customfields) {
  const listBody = {};
  if (name !== undefined) listBody.name = name;
  if (contacts !== undefined) listBody.contacts = contacts;
  if (customfields !== null && customfields) if (customfields.length > 0) listBody.customfields = customfields;
  return dispatch => {
    dispatch({ type: PATCH_LIST});
    return api.patch('/lists/' + listId, listBody)
    .then( response => dispatch(receiveList(response)))
    .catch( message => dispatch({ type: 'PATCH_LIST_FAIL', message }));
  };
}

export function createNewSheet(name, contactList) {
  return dispatch =>
  dispatch(contactActions.addContacts(contactList))
  .then( json => {
    const contacts = json.map( contact => contact.id );
    const listBody = {
      name: name,
      contacts: contacts
    };
    return api.post('/lists', listBody)
    .then( response => {
      dispatch(receiveList(response));
      window.location.href = window.location.origin + '/lists/' + response.id;
    })
    .catch( message => console.log(message));
  });
}

export function archiveListToggle(listId) {
  return (dispatch, getState) => {
    dispatch({ type: ARCHIVE_LIST });
    let listBody = getState().listReducer[listId];
    listBody.archived = !listBody.archived;
    return api.patch('/lists/' + listId, listBody)
    .then( response => dispatch(receiveList(response)))
    .catch( message => console.log(message));
  };
}
