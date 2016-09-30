import {mixedConstant} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const feedSchema = new Schema('feeds');
const tweetSchema = new Schema('tweets');

export function fetchMixedFeed(contactId) {
  return dispatch => {
    dispatch({type: feedConstant.REQUEST_MULTIPLE, contactId});
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
    })
    .catch(err => console.log(err));
  };
}