/*
 * AppConstants
 * These are the variables that determine what our central data store (reducer.js)
 * changes in our state. When you add a new action, you have to add a new constant here
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'YOUR_ACTION_CONSTANT';
 */
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const REQUEST_LOGIN = 'REQUEST_LOGIN';
export const RECEIVE_LOGIN = 'RECEIVE_LOGIN';

export const REQUEST_LISTS = 'REQUEST_LISTS';
export const RECEIVE_LISTS = 'RECEIVE_LISTS';
export const REQUEST_LISTS_FAIL = 'REQUEST_LISTS_FAIL';
export const REQUEST_LIST = 'REQUEST_LIST';
export const RECEIVE_LIST = 'RECEIVE_LIST';
export const PATCH_LIST = 'PATCH_LIST';
export const ARCHIVE_LIST = 'ARCHIVE_LIST';

export const ADDING_CONTACT = 'ADDING_CONTACT';
export const REQUEST_CONTACT = 'REQUEST_CONTACT';
export const RECEIVE_CONTACT = 'RECEIVE_CONTACT';
export const REQUEST_CONTACT_FAIL = 'REQUEST_CONTACT_FAIL';

export const RECEIVE_STAGED_EMAILS = 'RECEIVE_STAGED_EMAILS';
export const SENDING_STAGED_EMAILS = 'SENDING_STAGED_EMAILS';
export const RECEIVE_EMAIL = 'RECEIVE_EMAIL';

export const REQUEST_PUBLICATION = 'REQUEST_PUBLICATION';
export const RECEIVE_PUBLICATION = 'RECEIVE_PUBLICATION';

export const UPLOAD_FILE = 'UPLOAD_FILE';
export const UPLOAD_FILE_FAIL = 'UPLOAD_FILE_FAIL';
export const RECEIVE_FILE = 'RECEIVE_FILE';
export const REQUEST_HEADERS = 'REQUEST_HEADERS';
export const RECEIVE_HEADERS = 'RECEIVE_HEADERS';
export const TURN_ON_PROCESS_WAIT = 'TURN_ON_PROCESS_WAIT';
export const TURN_OFF_PROCESS_WAIT = 'TURN_OFF_PROCESS_WAIT';
