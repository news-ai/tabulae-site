import {instagramDataConstant} from './constants';
import * as api from '../../../../actions/api';

export function fetchContactInstagramData(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().instagramDataReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().instagramDataReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: instagramDataConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/instagramtimeseries?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      return dispatch({
        type: instagramDataConstant.RECEIVE,
        contactId,
        data: response.data,
        offset: response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(err => dispatch({type: instagramDataConstant.REQUEST_FAIL, message: err}));
  };
}
