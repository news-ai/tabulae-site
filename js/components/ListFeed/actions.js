import {listfeedConstant} from './constants';
import * as api from '../../actions/api';

export function fetchListFeed(listId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const listObj = getState().listfeedReducer[listId];
    const OFFSET = listObj ? listObj.offset : 0;
    const isReceiving = getState().listfeedReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: listfeedConstant.REQUEST_MULTIPLE, listId});
    return api.get(`/lists/${listId}/feed?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      let newOffset = OFFSET + response.data.length;
      if (newOffset > response.summary.total) newOffset === null;
      return dispatch({
        type: listfeedConstant.RECEIVE_MULTIPLE,
        feed: response.data,
        listId,
        offset: newOffset
      });
    })
    .catch(err => dispatch({type: listfeedConstant.REQUEST_MULTIPLE_FAIL, message: err}));
  };
}
