import {
  TAG_CONTACTS_REQUEST,
  TAG_CONTACTS_RECEIVE,
  TAG_CONTACTS_REQUEST_FAIL
} from './constants';
import * as api from 'actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts');
const listSchema = new Schema('lists');
const publicationSchema = new Schema('publications');

import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as contactActions} from 'components/Contacts';

export function fetchContactsByTag(tag) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const tagObj = getState().contactTagReducer[tag];
    const OFFSET = tagObj ? tagObj.offset : 0;
    if (OFFSET === null || getState().emailStatsReducer.isReceiving) return;
    dispatch({type: TAG_CONTACTS_REQUEST, tag});
    return api.get(`/contacts?q=tag:${tag}&limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(
      response => {
        const listOnly = response.included.filter(item => item.type === 'lists');
        const pubOnly = response.included.filter(item => item.type === 'publications');
        response.lists = listOnly;
        response.publications = pubOnly;
        const res = normalize(response, {
          data: arrayOf(contactSchema),
          lists: arrayOf(listSchema),
          publications: arrayOf(publicationSchema)
        });

        dispatch(listActions.receiveLists(res.entities.lists, res.result.lists, 0));
        dispatch(publicationActions.receivePublications(res.entities.publications, res.result.publications));
        const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
        dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.data));
        return dispatch({
          type: TAG_CONTACTS_RECEIVE,
          tag,
          received: res.result.data,
          offset: newOffset
        });
      },
      err => {
        dispatch({type: TAG_CONTACTS_REQUEST_FAIL});
        Promise.reject(err);
      }
    );
  };
}
