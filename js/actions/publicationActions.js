import {
  publicationConstant
} from '../constants/AppConstants';
import * as api from './api';

function requestPublication() {
  return {
    type: publicationConstant.REQUEST
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
    dispatch(requestPublication());
    return api.get(`/publications/${id}`)
    .then( response => dispatch(receivePublication(response.data)))
    .catch( message => dispatch(requestPublicationFail(message)));
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
