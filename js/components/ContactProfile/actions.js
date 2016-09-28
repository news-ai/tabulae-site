import {
  feedConstant,
} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const headlineSchema = new Schema('headlines', {idAttribute: 'url'});
const feedSchema = new Schema('feeds');
// const listSchema = new Schema('lists');

export function addFeed(contactid, listid, feedUrl) {
  return dispatch => {
    const feedBody = {contactid, listid, url: feedUrl};
    dispatch({type: feedConstant.ADD_REQUESTED, body: feedBody});
    return api.post(`/feeds`, feedBody)
    .then(response => dispatch({type: feedConstant.ADD_RECEIVED, response}))
    .catch(err => console.log(err));
  };
}

export function fetchContactFeeds(contactId) {
  return dispatch => {
    dispatch({type: feedConstant.REQUEST_MULTIPLE, contactId});
    return api.get(`/contacts/${contactId}/feeds`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(feedSchema),
      });
      return dispatch({
        type: feedConstant.RECEIVE_MULTIPLE,
        feeds: res.entities.feeds,
        ids: res.result.data,
        contactId
      });
    })
    .catch(err => console.log(err));
  };
}
