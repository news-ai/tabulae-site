import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  ARCHIVE_LIST,
  listConstant,
} from '../constants/AppConstants';
import * as contactActions from './contactActions';
import * as api from './api';


function requestLists() {
  return {
    type: REQUEST_LISTS
  };
}

function requestList(listId) {
  return {
    type: listConstant.REQUEST,
    listId
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
    type: listConstant.RECEIVE,
    list
  };
}

function requestListFail(message) {
  window.location.href = `${window.location.origin}/NotFound`;
  return {
    type: listConstant.REQUEST_FAIL,
    message
  };
}


export function fetchList(listId) {
  return dispatch => {
    dispatch(requestList(listId));
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

export function patchList({listId, name, contacts, fieldsmap}) {
  const listBody = {};
  if (name !== undefined) listBody.name = name;
  if (contacts !== undefined) listBody.contacts = contacts;
  listBody.fieldsmap = fieldsmap;
  return dispatch => {
    dispatch({ type: listConstant.PATCH, listId });
    return api.patch('/lists/' + listId, listBody)
    .then( response => dispatch(receiveList(response)))
    .catch( message => dispatch({ type: listConstant.PATCH_FAIL, message }));
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
      window.location.href = `${window.location.origin}/lists/${response.id}`;
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
