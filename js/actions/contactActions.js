import {
  ADDING_CONTACT,
  contactConstant,
  listConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL
} from '../constants/AppConstants';
import * as api from './api';
import * as publicationActions from './publicationActions';
import _ from 'lodash';

import { normalize, Schema, arrayOf } from 'normalizr';

const contactSchema = new Schema('contacts', { idAttribute: 'id' });
const publicationSchema = new Schema('publications', { idAttribute: 'id' });

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
    .then( response => {
      // const res = normalize(response, {data: contactSchema});
      return dispatch(receiveContact(response.data));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function patchContact(contactId, contactBody) {
  return (dispatch, getState) => {
    dispatch(requestContact());
    const contact = Object.assign({}, getState().contactReducer[contactId], contactBody);
    return api.patch(`/contacts/${contactId}`, contact)
    .then(response => {
      // const res = normalize(response, {data: contactSchema});
      return dispatch(receiveContact(response.data));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function deleteContact(contactId) {
  return dispatch => {
    dispatch({type: 'DELETE_CONTACT', contactId});
    return api.deleteRequest(`/contacts/${contactId}`)
    .then(response => console.log(response))
    .catch(err => console.log(err));
  };
}

export function deleteContacts(ids) {
  console.log(ids);
  return dispatch => {
    dispatch({type: 'DELETE_CONTACTS', ids});
    ids.map(id => dispatch(deleteContact(id)));
  };
}

// used to lazy-load a page, keeps track of the last offset
export function fetchPaginatedContacts(listId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    const OFFSET = getState().listReducer[listId].offset;
    if (OFFSET === null) return;
    dispatch(requestContact());
    return api.get(`/lists/${listId}/contacts?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      dispatch({
        type: listConstant.SET_OFFSET,
        offset: response.count === PAGE_LIMIT ? (PAGE_LIMIT + OFFSET) : null,
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

// fetch page without concern to where offset was last
function fetchContactsPage(listId, pageLimit, offset) {
  return dispatch => {
    return api.get(`/lists/${listId}/contacts?limit=${pageLimit}&offset=${offset}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(publicationActions.receivePublications(res.entities.publications, res.result.included));
      return dispatch(receiveContacts(res.entities.contacts, res.result.data));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

export function loadAllContacts(listId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    const contacts = getState().listReducer[listId].contacts;
    dispatch({type: 'FETCH_ALL_CONTACTS', listId});
    dispatch(requestContact());
    let promises = [];
    for (let i = 0; i < (contacts.length / PAGE_LIMIT) + 1; i++) {
      promises.push(
        dispatch(fetchContactsPage(listId, PAGE_LIMIT, i * PAGE_LIMIT))
      .then(_ => {
        // poll how many received
        const contactReducer = getState().contactReducer;
        const count = contacts.filter(id => contactReducer[id]).length;
        if (count < contacts.length) dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON});
        else dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
      })
      );
    }
    dispatch({
      type: listConstant.SET_OFFSET,
      offset: null,
      listId
    });
    return Promise.all(promises);
  };
}

export function fetchManyContacts(listId, amount) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contacts = getState().listReducer[listId].contacts;
    const offset = getState().listReducer[listId].offset || 0;
    const isReceiving = getState().contactReducer.isReceiving;
    if (contacts === null) return;
    const contactCount = contacts.filter(id => getState().contactReducer[id]).length;
    if (offset === null || isReceiving || contactCount === contacts.length) return;
    dispatch({type: 'FETCH_MANY_CONTACTS', listId});
    dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON});
    const startPage = offset / PAGE_LIMIT;
    const endPage = offset + amount >= contacts.length ? (contacts.length / PAGE_LIMIT) : (offset + amount) / PAGE_LIMIT;
    let promises = [];
    for (let i = startPage; i < endPage; i++) {
      promises.push(
        dispatch(fetchContactsPage(listId, PAGE_LIMIT, i * PAGE_LIMIT))
        .then(_ => {
          // poll how many received
          const contactReducer = getState().contactReducer;
          const count = contacts.filter(id => contactReducer[id]).length;
          if (offset + amount >= contacts.length && count === contacts.length) {
            dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
            return dispatch({type: listConstant.SET_OFFSET, listId, offset: null});
          } else if (count === offset + amount) {
            dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
            return dispatch({type: listConstant.SET_OFFSET, listId, offset: offset + amount});
          } else {
            return dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON});
          }
        })
        );
    }
    return Promise.all(promises);
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
      // console.log(response.data);

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


