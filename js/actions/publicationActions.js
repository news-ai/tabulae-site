import {
  REQUEST_PUBLICATION,
  RECEIVE_PUBLICATION,
} from '../constants/AppConstants';
import * as api from './api';

function requestPublication() {
  return {
    type: REQUEST_PUBLICATION
  };
}

function receivePublication(publication) {
  return {
    type: RECEIVE_PUBLICATION,
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
