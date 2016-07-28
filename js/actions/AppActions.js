import * as loginActions from './loginActions';
import * as listActions from './listActions';
import * as contactActions from './contactActions';

export const loginWithGoogle = _ => loginActions.loginWithGoogle();
export const fetchPerson = _ => loginActions.fetchPerson();

export const fetchLists = _ => listActions.fetchLists();
export const addListWithoutContacts = name => listActions.addListWithoutContacts(name);
export const fetchList = listId => listActions.fetchList(listId);
export const createNewSheet = (name, contactList) => listActions.createNewSheet(name, contactList);
export const patchList = (listId, name, contactList, customfields) => listActions.patchList(listId, name, contactList, customfields);
export const archiveListToggle = listId => listActions.archiveListToggle(listId);

export const addContact = body => contactActions.addContact(body);
export const addContacts = (listId, contactList) => contactActions.addContacts(listId, contactList);
export const patchContacts = (listId, contactList) => contactActions.patchContacts(listId, contactList);
export const fetchContacts = listId => contactActions.fetchContacts(listId);

