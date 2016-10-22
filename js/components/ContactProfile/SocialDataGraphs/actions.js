import {twitterDataConstant} from './constants';
import * as api from '../../../actions/api';

export function fetchContactTwitterData(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().twitterDataReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().twitterDataReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: twitterDataConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/twittertimeseries?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      return dispatch({
        type: twitterDataConstant.RECEIVE,
        contactId,
        data: response.data,
        offset: response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(err => dispatch({type: twitterDataConstant.REQUEST_FAIL, message: err}));
  };
}
