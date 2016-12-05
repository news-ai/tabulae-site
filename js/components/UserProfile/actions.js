import * as api from '../../actions/api';

export function invite(email) {
  return dispatch => {
    dispatch({type: 'INVITE', email});
    return api.post(`/invites`, {email})
    .then(response => true)
    .catch(err => {
      console.log(err);
      return false;
    });
  };
}

export function getInviteCount() {
  return dispatch => {
    dispatch({type: 'GET_INVITES'});
    return api.get(`/invites`)
    .then(response => response.count)
    .catch(err => console.log(err));
  };
}

export function setupSMTP(smtpObj) {
  return dispatch => {
    dispatch({type: 'SETUP_SMTP'});
    return api.post('/email-settings', smtpObj)
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log(err);
    });
  };
}

export function addSMTPEmail(username, password) {
  return dispatch => {
    dispatch({type: 'ADD_SMTP_EMAIL', username, password});
    let smtpObj = {
      smtpusername: username,
      smtppassword: password
    };
    return api.post('/email-settings/add-email', smtpObj)
    .then(response => {
      console.log(response);

    })
    .catch(err => {
      console.log(err);
    });
  };
}
