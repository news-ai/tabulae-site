import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET,
  FETCH_EMAIL_LOGS,
  FETCH_EMAIL_LOGS_FAIL,
  RECEIVE_EMAIL_LOGS,
} from './constants';
import {normalize, Schema, arrayOf} from 'normalizr';
import * as api from 'actions/api';
import isEmpty from 'lodash/isEmpty';

const emailSchema = new Schema('emails');

export function archiveEmail(emailId) {
  return dispatch => {
    dispatch({type: 'ARCHIVE_EMAIL', emailId});
    return api.get(`/emails/${emailId}/archive`)
    .then(response => {
      const res = normalize(response, {data: emailSchema});
      return dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result.data});
    });
  };
}

export function cancelScheduledEmail(id) {
  return (dispatch, getState) => {
    dispatch({type: 'CANCEL_SCHEDULED_EMAIL', id});
    return api.get(`/emails/${id}/cancel`)
    .then(response => {
      const res = normalize(response.data, emailSchema);
      dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    })
    .catch(err => dispatch({type: 'CANCEL_SCHEDULED_EMAIL_FAIL', err}));
  };
}

export function postBatchEmails(emails) {
  return dispatch => {
    dispatch({type: SENDING_STAGED_EMAILS, emails});
    return api.post(`/emails`, emails)
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
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

export function fetchLogs(emailId) {
  return (dispatch, getState) => {
    if (!getState().stagingReducer[emailId]) return;
    dispatch({type: FETCH_EMAIL_LOGS, emailId});
    return api.get(`/emails/${emailId}/logs`)
    .then(response => {
      const logs = response.data;
      const links = logs.reduce((a, b) => {
        if (b.Type === 'click' && b.Link) {
          a[b.Link] = a[b.Link] ? a[b.Link] + 1 : 1;
        }
        return a;
      }, {});
      return dispatch({
        type: RECEIVE_EMAIL_LOGS,
        logs,
        emailId,
        links: isEmpty(links) ? undefined : links,
      });
    })
    .catch(err => dispatch({type: FETCH_EMAIL_LOGS_FAIL, err}));
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
    .then(response => {
      return dispatch({type: 'ATTACHED_EMAIL_FILES', files: response.data});
    })
    .catch(err => dispatch({type: 'ATTACHED_EMAIL_FILES_FAIL', err}));
  };
}

export function postBatchEmailsWithAttachments(emails) {
  return dispatch => {
    dispatch({type: SENDING_STAGED_EMAILS, emails});
    return api.post(`/emails`, emails)
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
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

export function sendLimitedEmails(emailids) {
  return dispatch => {
    dispatch({type: 'SEND_EMAIL', emailids});
    return api.post(`/emails/bulksend`, {emailids})
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: 'RECEIVE_MULTIPLE_EMAILS_MANUAL',
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'SEND_EMAILS_FAIL', message}));
  };
}

export function bulkSendEmails(emailids) {
  return dispatch => {
    dispatch({type: 'START_BULK_SEND_EMAILS', emailids});
    dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_ON'});
    const LIMIT = 70;
    let promises = [];
    if (emailids.length > LIMIT) {
      let r = LIMIT;
      let l = 0;
      while (r < emailids.length) {
        promises.push(dispatch(sendLimitedEmails(emailids.slice(l, r))));
        l += LIMIT;
        r += LIMIT;
      }
      promises.push(dispatch(sendLimitedEmails(emailids.slice(l, emailids.length))));
    } else {
      promises.push(dispatch(sendLimitedEmails(emailids)));
    }
    return Promise.all(promises).then(_ => {
      dispatch({type: 'FINISHED_BULK_SEND_EMAILS'});
      dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_OFF'});
    });
  };
}

export function patchEmail(id, emailBody) {
  return dispatch => {
    dispatch({type: 'PATCH_EMAIL', id, emailBody});
    return api.patch(`/emails/${id}`, emailBody)
    .then(response => {
      const res = normalize(response.data, emailSchema);
      return dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    });
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
    if (OFFSET === null || getState().stagingReducer.isReceiving) return;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails/sent?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Created`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
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

export function fetchScheduledEmails() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().stagingReducer.scheduledOffset;
    if (OFFSET === null || getState().stagingReducer.isReceiving) return;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails/scheduled?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then( response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
      let newOffset = OFFSET + PAGE_LIMIT;
      if (response.data.length < PAGE_LIMIT) newOffset = null;
      dispatch({type: EMAIL_SET_OFFSET, scheduledOffset: newOffset});
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
  const PAGE_LIMIT = 20;
  return (dispatch, getState) => {
    let OFFSET = getState().stagingReducer.listOffsets[listId];
    const isReceiving = getState().stagingReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    if (!OFFSET) OFFSET = 0;
    dispatch({type: REQUEST_MULTIPLE_EMAILS, listId});
    return api.get(`/lists/${listId}/emails?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then( response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
        listId,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchContactEmails(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    let OFFSET = getState().stagingReducer.contactOffsets[contactId];
    const isReceiving = getState().stagingReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    if (!OFFSET) OFFSET = 0;
    dispatch({type: REQUEST_MULTIPLE_EMAILS}, contactId);
    return api.get(`/contacts/${contactId}/emails?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
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
