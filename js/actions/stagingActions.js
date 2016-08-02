import fetch from 'isomorphic-fetch';

export function postBatchEmails(emails) {
  console.log(JSON.stringify(emails));
  return (dispatch) => {
    return fetch(`${window.TABULAE_API_BASE}/emails`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(emails)
    })
    .then( response => response.status !== 200 ? false : response.text())
    .then( text => console.log(text));

  }

}