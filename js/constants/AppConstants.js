import {generateConstants} from './generateConstants';

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
export const ADDING_CONTACT = 'ADDING_CONTACT';