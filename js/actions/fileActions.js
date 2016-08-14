import {
  UPLOAD_FILE,
  UPLOAD_FILE_FAIL,
  RECEIVE_FILE,
  REQUEST_HEADERS,
  RECEIVE_HEADERS,
} from '../constants/AppConstants';
import * as api from './api';

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
    .catch( message => dispatch({ type: UPLOAD_FILE, message }));
  };
}

export function fetchHeaders(listId, fId) {
  return (dispatch, getState) => {
    let fileId;
    if (!getState().fileReducer[listId]) fileId = fId;
    else fileId = getState().fileReducer[listId].file.id;
    dispatch({ type: REQUEST_HEADERS, listId });
    return api.get('/files/' + fileId + '/headers')
    .then( response => dispatch({ type: RECEIVE_HEADERS, headers: response, listId }))
    .catch( message => dispatch({ type: 'REQUEST_HEADERS_FAIL', message }));
  };
}
