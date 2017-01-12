import * as listActions from './listActions';
import * as contactActions from './contactActions';
import * as stagingActions from '../components/Email/actions';
import * as loginActions from '../components/Login/actions';
import * as publicationActions from './publicationActions';
import * as fileActions from '../components/ImportFile/actions';
import * as templateActions from '../components/Email/Template/actions';
import * as imgActions from '../components/Email/EmailPanel/Image/actions';

export const loginWithGoogle = _ => loginActions.loginWithGoogle();
export const register = _ => loginActions.register();
export const logout = _ => loginActions.logout();
export const onLogin = _ => loginActions.onLogin();
export const fetchPerson = _ => loginActions.fetchPerson();
export const setFirstTimeUser = _ => loginActions.setFirstTimeUser();
export const removeFirstTimeUser = _ => loginActions.removeFirstTimeUser();
export const fetchNotifications = _ => loginActions.fetchNotifications();
export const patchPerson = person => loginActions.patchPerson(person);

export const fetchLists = _ => listActions.fetchLists();
export const fetchArchivedLists = _ => listActions.fetchArchivedLists();
export const fetchPublicLists = _ => listActions.fetchPublicLists();
export const fetchTagLists = tagQuery => listActions.fetchTagLists(tagQuery);
export const addListWithoutContacts = name => listActions.addListWithoutContacts(name);
export const fetchList = listId => listActions.fetchList(listId);
export const patchList = (listId, name, contactList, customfields) => listActions.patchList(listId, name, contactList, customfields);
export const archiveListToggle = listId => listActions.archiveListToggle(listId);
export const createEmptyList = untitledNum => listActions.createEmptyList(untitledNum);
export const copyEntireList = (id, name) => listActions.copyEntireList(id, name);

export const addContact = body => contactActions.addContact(body);
export const addContacts = (listId, contactList) => contactActions.addContacts(listId, contactList);
export const patchContacts = (listId, contactList) => contactActions.patchContacts(listId, contactList);
export const patchContact = (contactId, contactBody) => contactActions.patchContact(contactId, contactBody);
// export const fetchContacts = listId => contactActions.fetchPaginatedContacts(listId);
export const fetchContacts = listId => contactActions.fetchManyContacts(listId, 200);
export const updateContact = id => contactActions.updateContact(id);
export const searchListContacts = (listId, query) => contactActions.searchListContacts(listId, query);
export const loadAllContacts = listId => contactActions.loadAllContacts(listId);
export const deleteContact = contactId => contactActions.deleteContact(contactId);
export const deleteContacts = ids => contactActions.deleteContacts(ids);

export const postBatchEmails = emails => stagingActions.postBatchEmails(emails);
export const postBatchEmailsWithAttachments = emails => stagingActions.postBatchEmailsWithAttachments(emails);
export const sendEmail = id => stagingActions.sendEmail(id);
export const getStagedEmails = _ => stagingActions.getStagedEmails();
export const archiveEmail = id => stagingActions.archiveEmail(id);

export const uploadImage = file => imgActions.uploadImage(file);

export const fetchPublication = id => publicationActions.fetchPublication(id);
export const patchPublication = (publicationId, publicationBody) => publicationActions.patchPublication(publicationId, publicationBody);
export const createPublication = data => publicationActions.createPublication(data);
export const searchPublications = query => publicationActions.searchPublications(query);
export const createPublicationThenPatchContact = (contactId, pubName, which) => publicationActions.createPublicationThenPatchContact(contactId, pubName, which);
export const searchPublicationsByIdName = query => publicationActions.searchPublicationsByIdName(query);

export const uploadFile = (listId, file) => fileActions.uploadFile(listId, file);
export const fetchHeaders = listId => fileActions.fetchHeaders(listId);
export const addHeaders = (listId, order) => fileActions.addHeaders(listId, order);
export const waitForServerProcess = listId => fileActions.waitForServerProcess(listId);

export const createTemplate = (name, subject, body) => templateActions.createTemplate(name, subject, body);
export const patchTemplate = (templateId, subject, body) => templateActions.patchTemplate(templateId, subject, body);
export const getTemplates = _ => templateActions.getTemplates();
export const toggleArchiveTemplate = templateId => templateActions.toggleArchiveTemplate(templateId);
