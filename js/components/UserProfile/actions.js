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

