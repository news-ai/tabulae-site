import {
  REQUEST_CONTACT,
  RECEIVE_CONTACT,
  REQUEST_CONTACT_FAIL,
  ADDING_CONTACT,
} from '../constants/AppConstants';
import * as api from './api';
import * as publicationActions from './publicationActions';

function requestContact() {
  return {
    type: REQUEST_CONTACT
  };
}

function receiveContact(contact) {
  return dispatch => {
    // if (contact.employers !== null) contact.employers.map( pubId => dispatch(publicationActions.fetchPublication(pubId)));
    return dispatch({
      type: RECEIVE_CONTACT,
      contact
    });
  };
}

function requestContactFail(message) {
  return {
    type: REQUEST_CONTACT_FAIL,
    message
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
        type: 'SET_OFFSET',
        offset: newOffset,
        listId
      });
      console.log(response);
      response.includes.map( publication => dispatch(publicationActions.receivePublication(publication)));
      response.results.map( contact => dispatch(receiveContact(contact)));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function updateContact(id) {
  return dispatch => {
    return api.get('/contacts/' + id + '/update')
    .then( response => dispatch(receiveContact(response)))
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function patchContacts(contactList) {
  return dispatch => {
    dispatch({ type: 'PATCH_CONTACTS', contactList });

    return api.patch('/contacts', contactList)
    .then( response => {
      response.map( contact => dispatch(receiveContact(contact)));
    })
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


