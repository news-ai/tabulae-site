import validator from 'validator';
import Handsontable from 'handsontable/dist/handsontable.full';
// import {toCenterRenderer} from './CustomRenderers';

function _onInvalid(value, callback, validate) {
  if (value.length === 0 || validate(value)) callback(true);
  else callback(false);
}

export const COLUMNS = [
  {
    data: 'selected',
    title: 'Selected',
    type: 'checkbox',
  },
  // {
  //   data: 'isoutdated',
  //   title: 'Update',
  // },
  {
    data: 'firstname',
    title: 'First Name',
  },
  {
    data: 'lastname',
    title: 'Last Name',
  },
  {
    data: 'email',
    title: 'Email',
    validator: (value, callback) => _onInvalid(value, callback, validator.isEmail),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
  },
  {
    data: 'linkedin',
    title: 'LinkedIn',
    validator: (value, callback) => _onInvalid(value, callback, validator.isURL),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
  },
  {
    data: 'twitter',
    title: 'Twitter',
  },
  {
    data: 'instagram',
    title: 'Instagram',
  },
  {
    data: 'notes',
    title: 'Notes',
  },
  {
    data: 'blog',
    title: 'Blog',
  },
  // {
  //   data: 'id',
  //   title: 'ID',
  // },
  // {
  //   data: 'parent',
  //   title: 'Parent'
  // }
];
