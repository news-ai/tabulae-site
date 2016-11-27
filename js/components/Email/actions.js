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

export function cancelScheduledEmail(id) {
  return (dispatch, getState) => {
    dispatch({type: 'CANCEL_SCHEDULED_EMAIL', id});
    return api.get(`/emails/${id}/cancel`)
    .then(response => {
      const res = normalize(response.data, emailSchema);
      dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    })
    .catch(err => console.log(err));
  };
}

export function postBatchEmails(emails) {
  return dispatch => {
    dispatch({type: SENDING_STAGED_EMAILS, emails});
    return api.post(`/emails`, emails)
    .then(response => {
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
    .catch( message => dispatch({type: 'STAGING_EMAILS_FAIL', message}));
  };
}

export function postAttachments(emailid) {
  return (dispatch, getState) => {
    const files = getState().emailAttachmentReducer.attached;
    if (files.length === 0) return;
    let data = new FormData();
    files.map(file => data.append('file', file, file.name));
    dispatch({type: 'ATTACHING_EMAIL_FILES', files});
    return api.postFile(`/emails/${emailid}/attach`, data)
    .then(response => dispatch({type: 'ATTACHED_EMAIL_FILES', files: response.data}))
    .catch(err => dispatch({type: 'ATTACHED_EMAIL_FILES_FAIL', err}));
  };
}

export function postBatchEmailsWithAttachments(emails) {
  return dispatch => {
    dispatch({ type: SENDING_STAGED_EMAILS, emails });
    return api.post(`/emails`, emails)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(emailSchema)
      });
      const ids = res.result.data;
      const postFilePromises = ids.map(id => dispatch(postAttachments(id)));
      dispatch({type: 'ALL_EMAIL_ATTACHMENTS_START'});
      return Promise.all(postFilePromises)
        .then(results => {
          dispatch({type: 'ALL_EMAIL_ATTACHMENTS_FINISHED'});
          dispatch({
            type: RECEIVE_STAGED_EMAILS,
            emails: res.entities.emails,
            ids,
            previewEmails: response.data
          });
        });
    })
    .catch( message => dispatch({type: 'STAGING_EMAILS_FAIL', message}));
  };
}

export function sendEmail(id) {
  return dispatch => {
    dispatch({type: 'SEND_EMAIL', id});
    return api.get(`/emails/${id}/send`)
    .then(response => {
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
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    let OFFSET = getState().stagingReducer.contactOffset[contactId];
    const isReceiving = getState().stagingReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    if (!OFFSET) OFFSET = 0;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/contacts/${contactId}/emails?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(emailSchema)
      });
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
        contactId,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}
