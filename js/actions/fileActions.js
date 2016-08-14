import {
  UPLOAD_FILE,
  UPLOAD_FILE_FAIL,
  RECEIVE_FILE,
  REQUEST_HEADERS,
  RECEIVE_HEADERS,
} from '../constants/AppConstants';
import * as api from './api';

function receiveFile(file) {
  return {
    type: RECEIVE_FILE,
    file
  };
}

export function uploadFile(listId, file) {
  return dispatch => {
    dispatch({ type: UPLOAD_FILE, listId, file});
    return api.postFile('/lists/' + listId + '/upload', file)
    .then( response => dispatch(receiveFile(response)))
    .catch( message => dispatch({ type: UPLOAD_FILE, message }));
  };
}

export function fetchHeaders(fileId) {
  return dispatch => {
    dispat  return api.get('/files/' + fileId + '/headers')
    .then( response => dispatch({ type: RECEIVE_HEADERS, headers: response, fileId }))
    .catch( message => dispatch({ type: 'REQUEST_HEADERS_FAIL', message });
  };
}
