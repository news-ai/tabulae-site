import {
  REQUEST_PUBLICATION,
  RECEIVE_PUBLICATION,
} from '../constants/AppConstants';


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
    console.log(id);
    return fetch(`${window.TABULAE_API_BASE}/publications/${id}`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => dispatch(receivePublication(JSON.parse(body))));
  };
}
