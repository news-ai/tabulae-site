import {
  feedConstant,
} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const headlineSchema = new Schema('headlines', {idAttribute: 'url'});
// const listSchema = new Schema('lists');

export function addFeed(contactid, listid, feedUrl) {
  return dispatch => {
    const feedBody = {contactid, listid, url: feedUrl};
    dispatch({type: feedConstant.ADD_REQUESTED, body: feedBody});
    return api.post(`/feeds`, feedBody)
    .then(response => dispatch({type: feedConstant.ADD_REQUESTED, response}))
    .catch(err => console.log(err));
  };
}

export function fetchContactHeadlines(contactId) {
  return dispatch => {
    dispatch({type: feedConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/headlines`)
    .then(response => {
      console.log(response);
      const res = normalize(response, {
        data: arrayOf(headlineSchema),
      });
      console.log(res);
      return dispatch({type: feedConstant.RECEIVE, contactId, headlines: res.entities.headlines, ids: res.result.data});
    })
    .catch(err => console.log(err));
  };
}
