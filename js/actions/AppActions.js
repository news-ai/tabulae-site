import * as loginActions from './loginActions';
import * as listActions from './listActions';
import * as contactActions from './contactActions';

export const loginWithGoogle = _ => loginActions.loginWithGoogle();
export const fetchPerson = _ => loginActions.fetchPerson();

export const fetchLists = _ => listActions.fetchLists();
export const addListWithoutContacts = name => listActions.addListWithoutContacts(name);
export const fetchList = listId => listActions.fetchList(listId);

export const addContact = body => contactActions.addContact(body);
export const addContacts = (listId, contactList) => contactActions.addContacts(listId, contactList);

