import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET
} from './constants';
import {normalize, Schema, arrayOf} from 'normalizr';
import * as api from '../../actions/api';

const emailSchema = new Schema('emails');

export function postBatchEmails(emails) {
  return dispatch => {
    dispatch({ type: SENDING_STAGED_EMAILS, emails });
    return api.post(`/emails`, emails)
    .then( response => {
      const res = normalize(response, {
        data: arrayOf(emailSchema)
      });
      return dispatch({
        type: RECEIVE_STAGED_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
        previewEmails: response.data
      });
    })
    .catch( message => dispatch({ type: 'STAGING_EMAILS_FAIL', message}));
  };
}

export function sendEmail(id) {
  return dispatch => {
    dispatch({ type: 'SEND_EMAIL', id });
    return api.get(`/emails/${id}/send`)
    .then( response => {
      const res = normalize(response.data, emailSchema);
      dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    })
    .catch( message => dispatch({type: 'SEND_EMAILS_FAIL', message}));
  };
}

export function getStagedEmails() {
  return dispatch => {
    return api.get(`/emails`)
    .then(response => {
      const json = response.data.filter( email => !email.issent);
      return dispatch({type: RECEIVE_STAGED_EMAILS, json});
    })
    .catch(message => dispatch({type: 'STAGING_EMAILS_FAIL', message}));
  };
}

export function fetchSentEmails() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().stagingReducer.offset;
    if (OFFSET === null) return;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Created`)
    .then( response => {
      const res = normalize(response, {
        data: arrayOf(emailSchema)
      });
      let newOffset = OFFSET + PAGE_LIMIT;
      if (response.data.length < PAGE_LIMIT) newOffset = null;
      dispatch({type: EMAIL_SET_OFFSET, offset: newOffset});

      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchListEmails(listId) {
  return (dispatch) => {
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/lists/${listId}/emails`)
    .then( response => {
      const res = normalize(response, {
        data: arrayOf(emailSchema)
      });
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchContactEmails(contactId) {
  return (dispatch) => {
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/contacts/${contactId}/emails`)
    .then( response => {
      const res = normalize(response, {
        data: arrayOf(emailSchema)
      });
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}
