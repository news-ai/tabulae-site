import * as api from '../../actions/api';
import { loginConstant } from './constants';


function requestLogin() {
  return {
    type: loginConstant.REQUEST
  };
}

function receiveLogin(person) {
  window.Intercom('update', {
    app_id: 'ur8dbk9e',
    email: person.data.email,
    name: `${person.data.firstname} ${person.data.lastname}`,
    created_at: Date.now(),
    user_id: person.data.id
  });
  return {
    type: loginConstant.RECEIVE,
    person
  };
}

function loginFail(message) {
  return {
    type: loginConstant.REQUEST_FAIL,
    message
  };
}

export function loginWithGoogle() {
  const base = `${window.TABULAE_API_BASE}/auth/google?next=${window.location}`;
  console.log(base);
  window.location.href = base;
}

export function onLogin() {
  const base = `${window.TABULAE_API_BASE}/auth?next=${window.location}`;
  window.location.href = base;
}

export function register() {
  const base = `${window.TABULAE_API_BASE}/auth/registration?next=${window.location}`;
  window.location.href = base;
}

export function logout() {
  const base = `${window.TABULAE_API_BASE}/auth/logout?next=${window.location}`;
  window.location.href = base;
}

export function fetchPerson() {
  return dispatch => {
    dispatch(requestLogin());
    return api.get('/users/me')
    .then( response => dispatch(receiveLogin(response)))
    .catch( message => console.log(message));
    // .catch( message => dispatch(loginFail(message)));
  };
}
