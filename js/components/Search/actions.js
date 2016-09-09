import {
  searchConstant
} from './constants';
import * as api from '../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts');

export function fetchSearch(query) {
  return dispatch => {
    return api.get(`/contacts?q="${query}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema)
      });
      return dispatch({type: searchConstant.RECEIVE_MULTIPLE, contacts: res.entities.data})
    })
    .catch(err => throw err);
  }
}
