import {mixedConstant} from './constants';
import * as api from '../../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const feedSchema = new Schema('feeds');
const tweetSchema = new Schema('tweets');

export function fetchMixedFeed(contactId) {
  return dispatch => {
    dispatch({type: mixedConstant.REQUEST_MULTIPLE, contactId});
    return api.get(`/contacts/${contactId}/feed`)
    .then(response => {
      console.log(response);
      // const res = normalize(response, {
      //   data: arrayOf(feedSchema),
      // });
      // return dispatch({
      //   type: feedConstant.RECEIVE_MULTIPLE,
      //   feeds: res.entities.feeds,
      //   ids: res.result.data,
      //   contactId
      // });
      return dispatch({type: mixedConstant.RECEIVE_MULTIPLE, feed: response.data, contactId, offset: 0});
    })
    .catch(err => console.log(err));
  };
}
