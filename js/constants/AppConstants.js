import { generateConstants } from './generateConstants';

export const commonTypes = [
  'REQUEST',
  'RECEIVE',
  'REQUEST_FAIL',
  'REQUEST_MULTIPLE',
  'RECEIVE_MULTIPLE',
  'REQUEST_MULTIPLE_FAIL',
  'PATCH',
  'PATCH_FAIL',
  'LAST_USED',
  'CREATE_REQUEST',
  'CREATE_RECEIVED',
  'SET_OFFSET',
  'MANUALLY_SET_ISRECEIVING_ON',
  'MANUALLY_SET_ISRECEIVING_OFF',
  'ADD_REQUESTED',
  'ADD_RECEIVED',
  'REDUCER_RESET'
];

export const listConstant = generateConstants(commonTypes, 'LIST');
export const contactConstant = generateConstants(commonTypes, 'CONTACT');
export const publicationConstant = generateConstants(commonTypes, 'PUBLICATION');

// custom action types
export const ARCHIVE_LIST = 'ARCHIVE_LIST';

export const ADDING_CONTACT = 'ADDING_CONTACT';

export const LIST_CONTACTS_SEARCH_REQUEST = 'LIST_CONTACTS_SEARCH_REQUEST';
export const LIST_CONTACTS_SEARCH_RECEIVED = 'LIST_CONTACTS_SEARCH_RECEIVED';
export const LIST_CONTACTS_SEARCH_FAIL = 'LIST_CONTACTS_SEARCH_FAIL';
