import {
  UPLOAD_FILE,
  UPLOAD_FILE_FAIL,
  RECEIVE_FILE,
  REQUEST_HEADERS,
  RECEIVE_HEADERS,
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT
} from '../constants/AppConstants';
import * as api from './api';
import * as listActions from './listActions';
import * as contactActions from './contactActions';

function receiveFile(file, listId) {
  return {
    type: RECEIVE_FILE,
    file,
    listId
  };
}

export function uploadFile(listId, file) {
  return dispatch => {
    dispatch({ type: UPLOAD_FILE, listId, file});
    return api.postFile('/lists/' + listId + '/upload', file)
    .then( response => dispatch(receiveFile(response, listId)))
    .catch( message => dispatch({ type: UPLOAD_FILE_FAIL, message }));
  };
}

export function fetchHeaders(listId) {
  return (dispatch, getState) => {
    let fileId = getState().fileReducer[listId].id;
    dispatch({ type: REQUEST_HEADERS, listId });
    return api.get('/files/' + fileId + '/headers')
    .then( response => dispatch({ type: RECEIVE_HEADERS, headers: response, listId }))
    .catch( message => dispatch({ type: 'REQUEST_HEADERS_FAIL', message }));
  };
}

export function waitForServerProcess(listId) {
  return dispatch => {
    setTimeout( _ => {
      dispatch({ type: TURN_OFF_PROCESS_WAIT});
      return dispatch(listActions.fetchList(listId))
      .then( _ => dispatch(contactActions.fetchContacts(listId)));
    }, 10000);
  };
}

export function addHeaders(listId, order) {
  return (dispatch, getState) => {
    dispatch({ type: 'ADDING_HEADER', order });
    dispatch({ type: TURN_ON_PROCESS_WAIT });
    let fileId = getState().fileReducer[listId].id;

    return api.post('/files/' + fileId + '/headers', {order: order})
    .then( response => dispatch({ type: 'ADDED_HEADER', response }))
    .catch( message => dispatch({ type: 'REQUEST_HEADERS_FAIL', message }));
  };
}
