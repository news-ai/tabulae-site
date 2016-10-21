import {
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT,
  fileConstant,
  headerConstant
} from './constants';
import * as api from '../../actions/api';

function receiveFile(file, listId) {
  return {
    type: fileConstant.RECEIVE,
    file,
    listId
  };
}

export function uploadFile(listId, file) {
  return dispatch => {
    dispatch({type: fileConstant.REQUEST, listId, file});
    return api.postFile(`/lists/${listId}/upload`, file)
    .then( response => dispatch(receiveFile(response.data, listId)))
    .catch( message => dispatch({ type: fileConstant.REQUEST_FAIL, message }));
  };
}

export function fetchHeaders(listId) {
  return (dispatch, getState) => {
    const fileId = getState().fileReducer[listId].id;
    dispatch({type: headerConstant.REQUEST, listId});
    return api.get(`/files/${fileId}/headers`)
    .then(response => dispatch({type: headerConstant.RECEIVE, headers: response.data, listId}))
    .catch(message => dispatch({type: headerConstant.REQUEST_FAIL, message, listId}));
  };
}

export function waitForServerProcess(listId) {
  return dispatch => {
    dispatch({type: TURN_ON_PROCESS_WAIT});
    setTimeout( _ => {
      window.location.href = window.location.origin + '/tables/' + listId;
    }, 5000);
  };
}

export function addHeaders(listId, order) {
  return (dispatch, getState) => {
    dispatch({type: headerConstant.CREATE_REQUEST, order});
    dispatch(waitForServerProcess(listId));
    const fileId = getState().fileReducer[listId].id;

    return api.post(`/files/${fileId}/headers`, {order: order})
    .then(response => {
      dispatch({type: headerConstant.CREATE_RECEIVED, response});
    })
    .catch( message => dispatch({type: headerConstant.REQUEST_FAIL, message}));
  };
}
