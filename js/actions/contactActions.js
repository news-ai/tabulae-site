import {
  ADDING_CONTACT,
  SET_OFFSET,
  contactConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL
} from '../constants/AppConstants';
import * as api from './api';
import * as publicationActions from './publicationActions';
import _ from 'lodash';

import { normalize, Schema, arrayOf } from 'normalizr';

const contactSchema = new Schema('contacts');
const publicationSchema = new Schema('publications');

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

// helper function
function stripOutEmployers(publicationReducer, contacts, ids) {
  const newContacts = {};
  ids.map(id => {
    newContacts[id] = Object.assign({}, contacts[id]);
    if (!_.isEmpty(contacts[id].employers)) {
      contacts[id].employers.map((employerId, i) => {
        if (publicationReducer[employerId]) newContacts[id][`publication_name_${i + 1}`] = publicationReducer[employerId].name;
      });
    }
  });
  return newContacts;
}

function receiveContacts(contacts, ids) {
  return (dispatch, getState) => {
    const publicationReducer = getState().publicationReducer;
    const contactsWithEmployers = stripOutEmployers(publicationReducer, contacts, ids);

    dispatch({
      type: contactConstant.RECEIVE_MULTIPLE,
      contacts: contactsWithEmployers,
      ids
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

export function fetchPaginatedContacts(listId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    dispatch(requestContact());
    const offset = getState().listReducer[listId].offset;
    return api.get(`/lists/${listId}/contacts?limit=${PAGE_LIMIT}&offset=${offset}`)
    .then(response => {
      const newOffset = offset + PAGE_LIMIT;
      dispatch({
        type: SET_OFFSET,
        offset: newOffset,
        listId
      });
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(publicationActions.receivePublications(res.entities.publications, res.result.included));
      dispatch(receiveContacts(res.entities.contacts, res.result.data));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function searchListContacts(listId, query) {
  return (dispatch, getState) => {
    dispatch({ type: LIST_CONTACTS_SEARCH_REQUEST, listId, query});
    return api.get(`/lists/${listId}/contacts?q="${query}"&limit=50&offset=0`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      console.log(response.data);

      // dispatch(publicationActions.receivePublications(res.entities.publications, res.result.included));
      // dispatch(receiveContacts(res.entities.contacts, res.result.data));
      const ids = res.result.data;
      const contacts = res.entities.contacts;
      ids.map(id => {
        if (contacts[id].customfields && contacts[id].customfields !== null) {
          contacts[id].customfields.map(field => {
            contacts[id][field.name] = field.value;
          });
        }
      });
      const publicationReducer = getState().publicationReducer;
      const contactsWithEmployers = stripOutEmployers(publicationReducer, contacts, ids);
      dispatch({type: LIST_CONTACTS_SEARCH_RECEIVED, ids, contactsWithEmployers, listId});
      return {searchContactMap: contactsWithEmployers, ids};
    })
    .catch(message => dispatch({type: LIST_CONTACTS_SEARCH_FAIL, message}));
  };
}

export function updateContact(id) {
  return dispatch => {
    return api.get(`/contacts/${id}/update`)
    .then(response => dispatch(receiveContact(response.data)))
    .catch(message => dispatch(requestContactFail(message)));
  };
}

export function patchContacts(contactList) {
  return dispatch => {
    dispatch({type: 'PATCH_CONTACTS', contactList});

    return api.patch(`/contacts`, contactList)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(receiveContacts(res.entities.contacts, res.result.data));
    })
    .catch(message => console.log(message));
  };
}

export function addContacts(contactList) {
  return dispatch => {
    dispatch({type: ADDING_CONTACT, contactList});

    return api.post(`/contacts`, contactList)
    .then( response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(receiveContacts(res.entities.contacts, res.result.data));
      return response.data;
    })
    .catch( message => console.log(message));
  };
}


