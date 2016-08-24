import {
  ADDING_CONTACT,
  SET_OFFSET,
  contactConstant
} from '../constants/AppConstants';
import * as api from './api';
import * as publicationActions from './publicationActions';

function requestContact() {
  return {
    type: contactConstant.REQUEST
  };
}

function receiveContact(contact) {
  return dispatch => {
    // if (contact.employers !== null) contact.employers.map( pubId => dispatch(publicationActions.fetchPublication(pubId)));
    return dispatch({
      type: contactConstant.RECEIVE,
      contact
    });
  };
}

function requestContactFail(message) {
  return {
    type: contactConstant.REQUEST_FAIL,
    message
  };
}


export function fetchContact(contactId) {
  return dispatch => {
    dispatch(requestContact());
    return api.get(`/contacts/${contactId}`)
    .then( response => dispatch(receiveContact(response)))
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function fetchContacts(listId, rangeStart, rangeEnd) {
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    getState().listReducer[listId].contacts.map( (contactId, i) => {
      if (rangeStart <= i && i < rangeEnd) {
        dispatch(fetchContact(contactId));
      }
    });
  };
}

export function fetchPaginatedContacts(listId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    dispatch(requestContact());
    const offset = getState().listReducer[listId].offset;
    return api.get(`/lists/${listId}/contacts/?limit=${PAGE_LIMIT}&offset=${offset}`)
    .then( response => {
      const newOffset = offset + PAGE_LIMIT;
      dispatch({
        type: SET_OFFSET,
        offset: newOffset,
        listId
      });
      response.included.map( publication => dispatch(publicationActions.receivePublication(publication)));
      response.data.map( contact => dispatch(receiveContact(contact)));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function updateContact(id) {
  return dispatch => {
    return api.get(`/contacts/${id}/update`)
    .then( response => dispatch(receiveContact(response.data)))
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function patchContacts(contactList) {
  return dispatch => {
    dispatch({ type: 'PATCH_CONTACTS', contactList });

    return api.patch(`/contacts`, contactList)
    .then( response => {
      response.data.map( contact => dispatch(receiveContact(contact)));
    })
    .catch( message => console.log(message));
  };
}

export function addContacts(contactList) {
  return dispatch => {
    dispatch({ type: ADDING_CONTACT, contactList });

    return api.post(`/contacts`, contactList)
    .then( response => {
      response.data.map( contact => dispatch(receiveContact(contact)));
      return response.data;
    })
    .catch( message => console.log(message));
  };
}


