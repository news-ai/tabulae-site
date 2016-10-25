import {
  publicationConstant
} from '../constants/AppConstants';
import * as api from './api';
import { normalize, Schema, arrayOf } from 'normalizr';

const publicationSchema = new Schema('publications');
import * as contactActions from './contactActions';


function requestPublication(id) {
  return {
    type: publicationConstant.REQUEST,
    id
  };
}

export function receivePublication(publication) {
  return {
    type: publicationConstant.RECEIVE,
    publication
  };
}

export function receivePublications(publications, ids) {
  return {
    type: publicationConstant.RECEIVE_MULTIPLE,
    publications,
    ids
  };
}

function requestPublicationFail(message) {
  return {
    type: publicationConstant.REQUEST_FAIL,
    message
  };
}

export function fetchPublication(id) {
  return (dispatch, getState) => {
    if (getState().publicationReducer[id]) if (getState().publicationReducer[id].isReceiving) return;
    dispatch(requestPublication(id));
    return api.get(`/publications/${id}`)
    .then( response => dispatch(receivePublication(response.data)))
    .catch( message => dispatch(requestPublicationFail(message)));
  };
}

export function searchPublications(query) {
  return (dispatch, getState) => {
    // implement search for match in cache first then after some time make the search call
    // maybe do some timeout
    dispatch({type: 'SEARCH_PUBLICATION_REQUEST', query});
    return api.get(`/publications?q="${query}"`)
      .then( response => {
        const res = normalize(response, {
          data: arrayOf(publicationSchema)
        });
        dispatch(receivePublications(res.entities.publications, res.result.data));
        const responseNameArray = response.data.map(publication => publication.name);
        return responseNameArray;
      })
      .catch( message => dispatch({type: 'SEARCH_PUBLICATION_FAIL', message}));
  };
}

export function searchPublicationsByIdName(query) {
  return (dispatch, getState) => {
    // implement search for match in cache first then after some time make the search call
    // maybe do some timeout
    dispatch({type: 'SEARCH_PUBLICATION_REQUEST', query});
    return api.get(`/publications?q="${query}"`)
      .then( response => {
        const res = normalize(response, {
          data: arrayOf(publicationSchema)
        });
        dispatch(receivePublications(res.entities.publications, res.result.data));
        const responseArray = response.data.map(publication => ({label: publication.name, value: publication.id}));
        return responseArray;
      })
      .catch( message => dispatch({type: 'SEARCH_PUBLICATION_FAIL', message}));
  };
}

export function createPublication(data) {
  return (dispatch) => {
    dispatch(requestPublication());
    return api.post(`/publications`, data)
    .then( response => {
      dispatch(receivePublication(response.data));
      return response;
    })
    .catch( message => dispatch(requestPublicationFail(message)));
  };
}

export function createPublicationThenPatchContact(contactId, pubName, which) {
  return (dispatch, getState) => {
    dispatch({type: 'CREATE_PUBLICATION_THEN_PATCH_CONTACT'});
    const pubId = getState().publicationReducer[pubName];
    if (pubId) {
      const contact = getState().contactReducer[contactId];
      if (contact) {
        const employers = contact[which] === null ? [pubId] : [...contact[which], pubId];
        let contactBody = {};
        contactBody[which] = employers;
        dispatch(contactActions.patchContact(contactId, contactBody));
      }
    } else {
      dispatch(createPublication({name: pubName}))
      .then(response => {
        const newPubId = response.data.id;
        const contact = getState().contactReducer[contactId];
        if (contact) {
          const employers = contact[which] === null ? [newPubId] : [...contact[which], newPubId];
          let contactBody = {};
          contactBody[which] = employers;
          dispatch(contactActions.patchContact(contactId, contactBody));
        }
      });
    }
  };
}
