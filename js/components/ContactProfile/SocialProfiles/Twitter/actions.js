import {twitterProfileConstant} from './constants';
import * as api from '../../../../actions/api';
// const listSchema = new Schema('lists');

export function fetchTwitterProfile(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const isReceiving = getState().twitterProfileReducer.isReceiving;
    if (isReceiving) return;
    dispatch({type: twitterProfileConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/twitterprofile`)
    .then(response => {
      const res = response.data;
      return dispatch({
        type: twitterProfileConstant.RECEIVE,
        contactId,
        profile: res,
      });
    })
    .catch(err => dispatch({type: twitterProfileConstant.REQUEST_FAIL, message: err}));
  };
}
