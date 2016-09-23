import {
  feedConstant,
} from './constants';
import * as api from '../../actions/api';
// import {normalize, Schema, arrayOf} from 'normalizr';
// const contactSchema = new Schema('contacts');
// const listSchema = new Schema('lists');
// import * as listActions from '../../actions/listActions';

export function addFeed(contactid, listid, feedUrl) {
  return dispatch => {
    let feedBody = {contactid, listid, url: feedUrl};
    dispatch({type: feedConstant.ADD_REQUESTED, body: feedBody});
    return api.post(`/feeds`, feedBody)
    .then(response => {
      console.log(response);
      return dispatch({type: feedConstant.ADD_REQUESTED});
    })
    .catch(err => console.log(err));
  };
}
