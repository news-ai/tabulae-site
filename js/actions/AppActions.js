import * as loginActions from './loginActions';
import * as listActions from './listActions';

export const loginWithGoogle = _ => loginActions.loginWithGoogle();
export const fetchPerson = _ => loginActions.fetchPerson();

export const fetchLists = _ => listActions.fetchLists();
export const addListWithoutContacts = name => listActions.addListWithoutContacts(name);

