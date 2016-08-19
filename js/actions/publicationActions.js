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

export function fetchPublication(id) {
  return (dispatch, getState) => {
    if (getState().publicationReducer[id]) return;
    dispatch(requestPublication());
    return api.get('/publications/' + id)
    .then( response => dispatch(receivePublication(response)))
    .catch( message => console.log(message));
  };
}

export function createPublication(data) {
  return (dispatch) => {
    dispatch(requestPublication());
    return api.post('/publications', data)
    .then( response => {
      dispatch(receivePublication(response));
      return response;
    })
    .catch( message => console.log(message));
  };
}
