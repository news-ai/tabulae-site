import {
  ARCHIVE_LIST,
  listConstant,
} from '../constants/AppConstants';
import * as api from './api';
import { normalize, Schema, arrayOf } from 'normalizr';

const listSchema = new Schema('lists');

function requestLists() {
  return {
    type: listConstant.REQUEST
  };
}

function requestList(listId) {
  return {
    type: listConstant.REQUEST,
    listId
  };
}

export function receiveLists(lists, ids, offset) {
  return {
    type: listConstant.RECEIVE_MULTIPLE,
    lists,
    ids,
    offset
  };
}

function receiveList(list, id) {
  return {
    type: listConstant.RECEIVE,
    list,
    id
  };
}

function requestListFail(message) {
  return {
    type: listConstant.REQUEST_FAIL,
    message
  };
}

function requestListsFail(message) {
  return {
    type: listConstant.REQUEST_MULTIPLE_FAIL,
    message
  };
}

export function listLastUsed() {
  return {
    type: listConstant.LAST_USED,
    time: Date.now()
  };
}

function requestListFail(message) {
  // window.location.href = `${window.location.origin}/NotFound`;
  return {
    type: listConstant.REQUEST_FAIL,
    message
  };
}

export function fetchList(listId) {
  return (dispatch, getState) => {
    if (getState().listReducer[listId]) return Promise.resolve();
    dispatch(requestList(listId));
    return api.get(`/lists/${listId}`)
    .then(response => {
      const res = normalize(response.data, listSchema);
      return dispatch(receiveList(res.entities.lists, res.result));
    })
    .catch( message => dispatch(requestListFail(message)));
  };
}

export function fetchLists() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().listReducer.offset;
    if (OFFSET === null || getState().listReducer.isReceiving) return;
    dispatch(requestLists());
    return api.get(`/lists?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Created`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(listSchema),
      });
      const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
      dispatch(receiveLists(res.entities.lists, res.result.data, newOffset));
    })
    .catch(message => dispatch(requestListsFail(message)));
  };
}

export function fetchPublicLists() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().listReducer.publicOffset;
    if (OFFSET === null || getState().listReducer.isReceiving) return;
    dispatch(requestLists());
    return api.get(`/lists/public?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(listSchema),
      });
      const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
      dispatch({
        type: listConstant.RECEIVE_MULTIPLE,
        lists: res.entities.lists,
        ids: res.result.data,
        publicOffset: newOffset
      });
    })
    .catch(message => dispatch(requestListsFail(message)));
  };
}

export function fetchTagLists(tagQuery) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    let OFFSET = getState().listReducer.tagOffset;
    if (OFFSET === null || getState().listReducer.isReceiving) return;
    if (tagQuery !== getState().listReducer.tagQuery) OFFSET = 0;
    dispatch(requestLists());
    return api.get(`/lists?q=tag:${tagQuery}&limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(listSchema),
      });
      const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
      dispatch({
        type: listConstant.RECEIVE_MULTIPLE,
        lists: res.entities.lists,
        ids: res.result.data,
        tagOffset: newOffset,
        tagQuery
      });
    })
    .catch(message => dispatch(requestListsFail(message)));
  };
}

export function fetchArchivedLists() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().listReducer.archivedOffset;
    if (OFFSET === null || getState().listReducer.isReceiving) return;
    dispatch(requestLists());
    return api.get(`/lists/archived?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Created`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(listSchema),
      });
      const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
      dispatch({
        type: listConstant.RECEIVE_MULTIPLE,
        lists: res.entities.lists,
        ids: res.result.data,
        archivedOffset: newOffset
      });
    })
    .catch(message => dispatch(requestListsFail(message)));
  };
}

export function patchList({listId, name, contacts, fieldsmap, tags}) {
  const listBody = {};
  if (name !== undefined) listBody.name = name;
  if (contacts !== undefined) listBody.contacts = contacts;
  if (fieldsmap !== undefined) listBody.fieldsmap = fieldsmap;
  if (tags !== undefined) listBody.tags = tags;
  return dispatch => {
    dispatch({type: listConstant.PATCH, listId, listBody});
    return api.patch(`/lists/${listId}`, listBody)
    .then(response => {
      const res = normalize(response.data, listSchema);
      return dispatch(receiveList(res.entities.lists, res.result));
    })
    .catch( message => dispatch({ type: listConstant.PATCH_FAIL, message }));
  };
}

export function createEmptyList(name) {
  return dispatch => {
    const listBody = {
      name,
      contacts: []
    };
    dispatch({type: 'LIST_CREATE_EMPTY'});
    return api.post(`/lists`, listBody)
    .then(response => response)
    .catch(message => console.log(message));
  };
}

export function archiveListToggle(listId) {
  return (dispatch, getState) => {
    dispatch({ type: ARCHIVE_LIST, listId});
    let listBody = getState().listReducer[listId];
    listBody.archived = !listBody.archived;
    return api.patch(`/lists/${listId}`, listBody)
    .then(response => {
      const res = normalize(response.data, listSchema);
      return dispatch(receiveList(res.entities.lists, res.result));
    })
    .catch( message => console.log(message));
  };
}
