import {
  searchConstant,
  SEARCH_CLEAR_CACHE
} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts');
const listSchema = new Schema('lists');


export function clearSearchCache() {
  return dispatch => dispatch({type: SEARCH_CLEAR_CACHE});
}

export function fetchSearch(query) {
  const PAGE_LIMIT = 50;
  if (query.length === 0) return;
  return (dispatch, getState) => {
    if (query !== getState().searchReducer.query) dispatch(clearSearchCache());
    const OFFSET = getState().searchReducer.offset;
    if (OFFSET === null) return;
    dispatch({type: searchConstant.REQUEST, query});
    return api.get(`/contacts?q="${query}"&limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(listSchema)
      });
      console.log(res);
      dispatch({type: searchConstant.SET_OFFSET, offset: response.count === PAGE_LIMIT ? (OFFSET + PAGE_LIMIT) : null, query});
      return dispatch({type: searchConstant.RECEIVE_MULTIPLE, contacts: res.entities.contacts, ids: res.result.data, query});
    })
    .catch(err => console.log(err));
  };
}
