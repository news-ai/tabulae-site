
import {
  searchConstant,
  SEARCH_CLEAR_CACHE
} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts');
const listSchema = new Schema('lists');
import * as listActions from '../../actions/listActions';


export function clearSearchCache() {
  return dispatch => dispatch({type: SEARCH_CLEAR_CACHE});
}

export function fetchSearch(query) {
  const PAGE_LIMIT = 50;
  if (query.length === 0) return;
  return (dispatch, getState) => {
    if (getState().searchReducer.isReceiving) return;
    if (query !== getState().searchReducer.query) dispatch(clearSearchCache());
    const OFFSET = getState().searchReducer.offset;
    if (OFFSET === null) return;
    dispatch({type: searchConstant.REQUEST_MULTIPLE, query});
    return api.get(`/contacts?q="${query}"&limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const listOnly = response.included.filter(item => item.type === 'lists');
      response.included = listOnly;
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(listSchema)
      });

      dispatch(listActions.receiveLists(res.entities.lists, res.result.included, null));
      dispatch({type: searchConstant.SET_OFFSET, offset: response.count === PAGE_LIMIT ? (OFFSET + PAGE_LIMIT) : null, query});
      return dispatch({type: searchConstant.RECEIVE_MULTIPLE, contacts: res.entities.contacts, ids: res.result.data, query});
    })
    .catch(err => console.log(err));
  };
}