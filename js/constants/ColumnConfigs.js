import validator from 'validator';
import Handsontable from 'handsontable/dist/handsontable.full';
import {toCenterRenderer} from './CustomRenderers';

function _onInvalid(value, callback, validate) {
  if (value.length === 0 || validate(value)) callback(true);
  else callback(false);
}

export const COLUMNS = [
  {
    data: 'selected',
    title: 'Selected',
    type: 'checkbox',
    renderer: toCenterRenderer
  },
  // {
  //   data: 'isoutdated',
  //   title: 'Update',
  // },
  {
    data: 'firstname',
    title: 'First Name',
    pass: true
  },
  {
    data: 'lastname',
    title: 'Last Name',
    pass: true
  },
  {
    data: 'email',
    title: 'Email',
    validator: (value, callback) => _onInvalid(value, callback, validator.isEmail),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
    pass: true
  },
  {
    data: 'linkedin',
    title: 'LinkedIn',
    validator: (value, callback) => _onInvalid(value, callback, validator.isURL),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
    pass: true
  },
  {
    data: 'twitter',
    title: 'Twitter',
    pass: true
  },
  {
    data: 'instagram',
    title: 'Instagram',
    pass: true
  },
  {
    data: 'notes',
    title: 'Notes',
    pass: true
  },
  {
    data: 'blog',
    title: 'Blog',
    pass: true
  },
  // {
  //   data: 'id',
  //   title: 'ID',
  //   pass: true
  // },
  // {
  //   data: 'parent',
  //   title: 'Parent'
  // }
];
