import {
  ARCHIVE_LIST,
  listConstant,
} from '../constants/AppConstants';
import * as contactActions from './contactActions';
import * as api from './api';
import { browserHistory } from 'react-router';


function requestLists() {
  return {
    type: listConstant.REQUEST
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
    type: listConstant.RECEIVE_MULTIPLE,
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
  return {
    type: listConstant.REQUEST_FAIL,
    message
  };
}

function requestListsFail(message) {
  return {
    type: listConstant.REQUEST_MULTIPLE_FAIL,
    message
  };
}

export function listLastUsed() {
  return {
    type: listConstant.LAST_USED,
    time: Date.now()
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
    return api.get(`/lists/${listId}`)
    .then( response => dispatch(receiveList(response.data)))
    .catch( message => dispatch(requestListFail(message)));
  };
}

export function fetchLists() {
  return dispatch => {
    dispatch(requestLists());
    return api.get(`/lists`)
    .then( response => dispatch(receiveLists(response.data)))
    .catch( message => dispatch(requestListsFail(message)));
  };
}

export function patchList({listId, name, contacts, fieldsmap}) {
  const listBody = {};
  if (name !== undefined) listBody.name = name;
  if (contacts !== undefined) listBody.contacts = contacts;
  if (fieldsmap !== undefined) listBody.fieldsmap = fieldsmap;
  return dispatch => {
    dispatch({ type: listConstant.PATCH, listId });
    return api.patch(`/lists/${listId}`, listBody)
    .then( response => dispatch(receiveList(response.data)))
    .catch( message => dispatch({ type: listConstant.PATCH_FAIL, message }));
  };
}

export function createEmptyList() {
  return dispatch => {
    const listBody = {
      name: 'untitled',
      contacts: []
    };
    return api.post(`/lists`, listBody)
    .then(response => {
      // dispatch(receiveList(response.data));
      browserHistory.push(`/lists/${response.data.id}`);
    })
    .catch(message => console.log(message));
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
    return api.post(`/lists`, listBody)
    .then( response => {
      dispatch(receiveList(response.data));
      window.location.href = `${window.location.origin}/lists/${response.data.id}`;
    })
    .catch( message => console.log(message));
  });
}

export function archiveListToggle(listId) {
  return (dispatch, getState) => {
    dispatch({ type: ARCHIVE_LIST });
    let listBody = getState().listReducer[listId];
    listBody.archived = !listBody.archived;
    return api.patch(`/lists/${listId}`, listBody)
    .then( response => dispatch(receiveList(response.data)))
    .catch( message => console.log(message));
  };
}
