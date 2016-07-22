import {
  REQUEST_LISTS,
  RECEIVE_LISTS,
  REQUEST_LISTS_FAIL
} from '../constants/AppConstants';


function requestLists() {
  return {
    type: REQUEST_LISTS
  };
}

function receiveLists(lists) {
  return {
    type: RECEIVE_LISTS,
    lists
  };
}

function requestListFail() {
  return {
    type: REQUEST_LISTS_FAIL
  };
}


export function fetchLists() {
  return dispatch => {
    dispatch(requestLists());
    return fetch(`${window.TABULAE_API_BASE}/lists`, { credentials: 'include'})
      .then( response => response.status !== 200 ? false : response.text())
      .then( body => {
        if (body) {
          const lists = JSON.parse(body);
          return dispatch(receiveLists(lists));
        } else {
          return dispatch(requestListFail());
        }
    });
  };
}

