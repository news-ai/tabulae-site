
import {
  headlineConstant,
} from './constants';
import * as api from '../../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const headlineSchema = new Schema('headlines', {idAttribute: 'url'});
// const listSchema = new Schema('lists');

export function fetchContactHeadlines(contactId) {
  return dispatch => {
    dispatch({type: headlineConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/headlines`)
    .then(response => {
      console.log(response);
      const res = normalize(response, {
        data: arrayOf(headlineSchema),
      });
      console.log(res);
      return dispatch({type: headlineConstant.RECEIVE, contactId, headlines: res.entities.headlines, ids: res.result.data});
    })
    .catch(err => {
      console.log(err)
      dispatch({type: headlineConstant.REQUEST_FAIL});
    });
  };
}
