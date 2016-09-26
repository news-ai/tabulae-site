import {
  publicationConstant
} from '../constants/AppConstants';
import * as api from './api';
import { normalize, Schema, arrayOf } from 'normalizr';

const publicationSchema = new Schema('publications');


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
    if (getState().publicationReducer[id]) return;
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
