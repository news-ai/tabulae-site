/*
 * AppConstants
 * These are the variables that determine what our central data store (reducer.js)
 * changes in our state. When you add a new action, you have to add a new constant here
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'YOUR_ACTION_CONSTANT';
 */

const commonUtilNames = [
  'REQUEST',
  'RECEIVE',
  'REQUEST_FAIL',
  'PATCH',
  'PATCH_FAIL',
  'LAST_USED',
];

// generate common action constants like ACTION_REQUEST, ACTION_RECEIVE, ACTION_REQUEST_FAIL
function generateConstants(parentName) {
  const obj = {};
  commonUtilNames.map( name => obj[name] = `${parentName}_${name}`);
  return obj;
}

export const loginConstant = generateConstants('LOGIN');
export const listConstant = generateConstants('LIST');
export const contactConstant = generateConstants('CONTACT');
export const publicationConstant = generateConstants('PUBLICATION');
export const fileConstant = generateConstants('UPLOAD_FILE');

// custom action types
export const REQUEST_LISTS = 'REQUEST_LISTS';
export const RECEIVE_LISTS = 'RECEIVE_LISTS';
export const SET_OFFSET = 'SET_OFFSET';
export const ARCHIVE_LIST = 'ARCHIVE_LIST';

export const ADDING_CONTACT = 'ADDING_CONTACT';

export const RECEIVE_STAGED_EMAILS = 'RECEIVE_STAGED_EMAILS';
export const SENDING_STAGED_EMAILS = 'SENDING_STAGED_EMAILS';
export const RECEIVE_EMAIL = 'RECEIVE_EMAIL';

export const REQUEST_HEADERS = 'REQUEST_HEADERS';
export const RECEIVE_HEADERS = 'RECEIVE_HEADERS';
export const TURN_ON_PROCESS_WAIT = 'TURN_ON_PROCESS_WAIT';
export const TURN_OFF_PROCESS_WAIT = 'TURN_OFF_PROCESS_WAIT';
