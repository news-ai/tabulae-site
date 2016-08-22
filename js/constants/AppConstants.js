import { generateConstants } from './generateConstants';

export const commonTypes = [
  'REQUEST',
  'RECEIVE',
  'REQUEST_FAIL',
  'PATCH',
  'PATCH_FAIL',
  'LAST_USED',
];

export const listConstant = generateConstants(commonTypes, 'LIST');
export const contactConstant = generateConstants(commonTypes, 'CONTACT');
export const publicationConstant = generateConstants(commonTypes, 'PUBLICATION');
export const fileConstant = generateConstants(commonTypes, 'UPLOAD_FILE');

// custom action types
export const REQUEST_LISTS = 'REQUEST_LISTS';
export const RECEIVE_LISTS = 'RECEIVE_LISTS';
export const SET_OFFSET = 'SET_OFFSET';
export const ARCHIVE_LIST = 'ARCHIVE_LIST';

export const ADDING_CONTACT = 'ADDING_CONTACT';

