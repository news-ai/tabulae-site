import {
  searchConstant
} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts');

export function fetchSearch(query) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().searchReducer.offset;
    if (OFFSET === null) return;
    dispatch({type: searchConstant.REQUEST, query});
    return api.get(`/contacts?q="${query}"&limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema)
      });
      dispatch({type: searchConstant.SET_OFFSET, offset: response.count === PAGE_LIMIT ? (OFFSET + PAGE_LIMIT) : null});
      return dispatch({type: searchConstant.RECEIVE_MULTIPLE, contacts: res.entities.contacts, ids: res.result.data});
    })
    .catch(err => console.log(err));
  };
}
