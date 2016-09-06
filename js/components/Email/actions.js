import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS
} from './constants';
import { normalize, Schema, arrayOf } from 'normalizr';
import * as api from '../../actions/api';

const emailSchema = new Schema('emails');

export function postBatchEmails(emails) {
  return dispatch => {
    dispatch({ type: SENDING_STAGED_EMAILS, emails });
    return api.post(`/emails`, emails)
    .then( response => dispatch({ type: RECEIVE_STAGED_EMAILS, json: response.data}))
    .catch( message => dispatch({ type: 'STAGING_EMAILS_FAIL', message}));
  };
}

export function sendEmail(id) {
  return dispatch => {
    dispatch({ type: 'SEND_EMAIL', id });
    return api.get(`/emails/${id}/send`)
    .then( response => dispatch({type: RECEIVE_EMAIL, json: response}))
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

export function getSentEmails() {
  return dispatch => {
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails?limit=50&offset=0`)
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


